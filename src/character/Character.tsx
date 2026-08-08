import { useGLTF, useAnimations } from '@react-three/drei'
import { Select } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { characterPosition } from './characterPosition'
import { characterMotion } from './characterMotion'
import { resolveCollisions, computeAvoidanceSteer } from './collision'
import {
  CHARACTER_BOUND,
  STUCK_DEBOUNCE_TIME,
  STUCK_PROGRESS_RATE_THRESHOLD,
  STUCK_DIRECTION_CHANGE_ANGLE,
} from '../world/constants'
import { useGardenStore, type MotionThresholds } from '../store/gardenStore'

/** Comic/cel-shading look toggle – flip to A/B compare against the PBR default. */
const TOON_SHADING_ENABLED = true

/** 3-step toon gradient map for hard cel-shading edges (module-level, per CLAUDE.md convention) */
const TOON_GRADIENT_STEPS = 3
const toonGradientMap = (() => {
  const data = new Uint8Array(TOON_GRADIENT_STEPS)
  for (let i = 0; i < TOON_GRADIENT_STEPS; i++) data[i] = (255 * i) / (TOON_GRADIENT_STEPS - 1)
  const texture = new THREE.DataTexture(data, TOON_GRADIENT_STEPS, 1, THREE.RedFormat)
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  texture.needsUpdate = true
  return texture
})()

/** Initial camera XZ offset – must match the value in App.tsx */
const INITIAL_CAM_X = 5
const INITIAL_CAM_Z = 5

/** Rotation lerp speed (0 = never, 1 = instant) */
const ROTATION_LERP = 0.12

/** World-unit movement below which facing is frozen (avoids jitter near-zero movement) */
const FACING_DEADZONE = 0.001

/** Smoothing factor for the speed estimate (0 = no smoothing, 1 = instant) */
const SPEED_SMOOTHING = 0.25

type MotionState = 'idle' | 'walk' | 'run'

/** Shortest-path angle lerp (handles ±PI wrap-around). */
function lerpAngle(current: number, target: number, t: number): number {
  let delta = target - current
  delta = ((delta % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI
  return current + delta * t
}

/**
 * Determine the next motion state from the current one + smoothed speed, using hysteresis
 * bands (separate enter/exit thresholds, live-tunable via the editor's motion panel) to
 * avoid flicker between animation states at the boundaries.
 */
function nextMotionState(
  current: MotionState,
  speed: number,
  thresholds: MotionThresholds,
): MotionState {
  switch (current) {
    case 'idle':
      return speed > thresholds.walkEnter ? 'walk' : 'idle'
    case 'walk':
      if (speed > thresholds.runEnter) return 'run'
      if (speed < thresholds.walkExit) return 'idle'
      return 'walk'
    case 'run':
      return speed < thresholds.runExit ? 'walk' : 'run'
  }
}

useGLTF.preload('/models/Character/character.glb')

export function Character() {
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const targetRotationRef = useRef(0)
  const motionStateRef = useRef<MotionState>('idle')
  const speedRef = useRef(0)
  const followStateRef = useRef<'resting' | 'following'>('resting')
  // Frozen while true: the character stopped making real progress toward the follow
  // target (blocked by a collider) and won't try again until the desired direction changes.
  const blockedRef = useRef(false)
  const stallTimeRef = useRef(0)
  const blockedDirRef = useRef({ x: 0, z: 0 })

  const { scene, animations } = useGLTF('/models/Character/character.glb')
  // Bind the mixer directly to the scene so bone track names resolve correctly
  const { actions, names } = useAnimations(animations, scene)

  const idleAnim = useMemo(() => names.find(n => /idle/i.test(n)) ?? names[0], [names])
  const walkAnim = useMemo(() => names.find(n => /walk/i.test(n)), [names])
  const runAnim = useMemo(() => names.find(n => /run/i.test(n)), [names])

  // Resolve each motion state to an available clip, falling back down the chain
  // (run → walk → idle) so nothing breaks if a clip is missing/named differently.
  const clipForState = useMemo(
    () => ({
      idle: idleAnim,
      walk: walkAnim ?? idleAnim,
      run: runAnim ?? walkAnim ?? idleAnim,
    }),
    [idleAnim, walkAnim, runAnim],
  )

  // Enable shadows on all meshes in the model
  useEffect(() => {
    scene.traverse(obj => {
      if ((obj as THREE.Mesh).isMesh) obj.castShadow = true
    })
  }, [scene])

  // Swap PBR materials for a cel-shaded look. Only the `material` field changes –
  // geometry, skin indices/weights and the skeleton are untouched, so Walk/Run/Idle
  // keep deforming normally.
  useEffect(() => {
    if (!TOON_SHADING_ENABLED) return
    const toToonMaterial = (material: THREE.Material) => {
      const source = material as THREE.MeshStandardMaterial
      return new THREE.MeshToonMaterial({
        map: source.map ?? null,
        color: source.map ? undefined : source.color,
        gradientMap: toonGradientMap,
        transparent: source.transparent,
        opacity: source.opacity,
        side: source.side,
      })
    }
    scene.traverse(obj => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(toToonMaterial)
        : toToonMaterial(mesh.material)
    })
  }, [scene])

  // Start idle animation – depend on names so this fires once animations are ready
  useEffect(() => {
    if (!idleAnim) return
    actions[idleAnim]?.reset().play()
    motionStateRef.current = 'idle'
    characterMotion.state = 'idle'
  }, [actions, idleAnim, names])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    // Freeze movement when embed panel is open, or while the editor's free-camera
    // mode is active (camera orbits independently, character stays put)
    if (useGardenStore.getState().isEmbedOpen || useGardenStore.getState().freeCameraMode) {
      characterPosition.copy(groupRef.current.position)
      return
    }

    const currentX = groupRef.current.position.x
    const currentZ = groupRef.current.position.z
    const targetX = THREE.MathUtils.clamp(
      camera.position.x - INITIAL_CAM_X,
      -CHARACTER_BOUND,
      CHARACTER_BOUND,
    )
    const targetZ = THREE.MathUtils.clamp(
      camera.position.z - INITIAL_CAM_Z,
      -CHARACTER_BOUND,
      CHARACTER_BOUND,
    )

    // Live-tunable via the editor's motion panel
    const lerpSpeed = useGardenStore.getState().characterLerpSpeed
    const maxSpeed = useGardenStore.getState().characterMaxSpeed
    const followDeadzone = useGardenStore.getState().characterFollowDeadzone
    const followCatchUp = useGardenStore.getState().characterFollowCatchUp

    // "Activation energy" for movement, with hysteresis (same idea as the walk/run
    // thresholds below) so a slow, continuous swipe doesn't stutter start/stop:
    // while resting, the target must pull further than followDeadzone away before the
    // character starts following at all; once following, it keeps chasing continuously
    // (ignoring followDeadzone) until it has essentially caught up (< followCatchUp)
    // before going back to resting. Tiny swipes that never cross followDeadzone never
    // move the character or trigger the idle→walk animation.
    const targetDistance = Math.hypot(
      targetX - groupRef.current.position.x,
      targetZ - groupRef.current.position.z,
    )
    if (followStateRef.current === 'resting') {
      if (targetDistance > followDeadzone) {
        followStateRef.current = 'following'
        blockedRef.current = false
        stallTimeRef.current = 0
      }
    } else if (targetDistance < followCatchUp) {
      followStateRef.current = 'resting'
      blockedRef.current = false
      stallTimeRef.current = 0
    }

    // While frozen, only resume once the desired travel direction has swung far enough
    // away from the one that got the character stuck (e.g. the user drags the camera
    // somewhere new) – re-testing the same direction every frame would just re-trigger
    // the same collision/stall over and over.
    if (followStateRef.current === 'following' && blockedRef.current) {
      const dirLen = Math.hypot(targetX - groupRef.current.position.x, targetZ - groupRef.current.position.z)
      if (dirLen > 1e-6) {
        const dirX = (targetX - groupRef.current.position.x) / dirLen
        const dirZ = (targetZ - groupRef.current.position.z) / dirLen
        const cosAngle = dirX * blockedDirRef.current.x + dirZ * blockedDirRef.current.z
        if (cosAngle < Math.cos(STUCK_DIRECTION_CHANGE_ANGLE)) {
          blockedRef.current = false
          stallTimeRef.current = 0
        }
      }
    }

    // Lerp only X and Z – Y (height above ground) stays constant
    let stepX = 0
    let stepZ = 0
    if (followStateRef.current === 'following' && !blockedRef.current) {
      stepX = (targetX - groupRef.current.position.x) * lerpSpeed
      stepZ = (targetZ - groupRef.current.position.z) * lerpSpeed
    }

    // Steer sideways around colliders the character is heading straight into, so it can
    // curve around obstacles to reach the target instead of getting stuck pressing against
    // them (plain push-out collision alone can pin the character at a flat wall approached
    // head-on, since the target sits directly behind it).
    const colliders = useGardenStore.getState().colliders
    if (followStateRef.current === 'following' && !blockedRef.current) {
      const [avoidX, avoidZ] = computeAvoidanceSteer(
        groupRef.current.position.x,
        groupRef.current.position.z,
        stepX,
        stepZ,
        colliders,
      )
      stepX += avoidX
      stepZ += avoidZ
    }

    // Cap the per-frame movement so the character never exceeds characterMaxSpeed,
    // regardless of how far behind the camera target it is (e.g. after a fast drag).
    const maxStep = maxSpeed * delta
    const stepMagnitude = Math.hypot(stepX, stepZ)
    if (stepMagnitude > maxStep && stepMagnitude > 0) {
      const scale = maxStep / stepMagnitude
      stepX *= scale
      stepZ *= scale
    }

    groupRef.current.position.x += stepX
    groupRef.current.position.z += stepZ

    // Resolve collisions with placed colliders
    const [resolvedX, resolvedZ] = resolveCollisions(
      groupRef.current.position.x,
      groupRef.current.position.z,
      colliders,
    )
    groupRef.current.position.x = resolvedX
    groupRef.current.position.z = resolvedZ

    // Stuck detection: if the character isn't actually closing distance to the target
    // (whether pinned dead still or just sliding/curving along a collider without real
    // progress), accumulate stall time and freeze in place once it's sustained – rather
    // than endlessly pressing/sliding against the obstacle every frame.
    if (followStateRef.current === 'following' && !blockedRef.current) {
      const distBefore = Math.hypot(targetX - currentX, targetZ - currentZ)
      const distAfter = Math.hypot(targetX - resolvedX, targetZ - resolvedZ)
      const progressRate = delta > 0 ? (distBefore - distAfter) / delta : 0
      if (progressRate < STUCK_PROGRESS_RATE_THRESHOLD) {
        stallTimeRef.current += delta
        if (stallTimeRef.current >= STUCK_DEBOUNCE_TIME) {
          blockedRef.current = true
          stallTimeRef.current = 0
          const dirLen = Math.hypot(targetX - resolvedX, targetZ - resolvedZ)
          blockedDirRef.current =
            dirLen > 1e-6
              ? { x: (targetX - resolvedX) / dirLen, z: (targetZ - resolvedZ) / dirLen }
              : { x: 0, z: 0 }
        }
      } else {
        stallTimeRef.current = 0
      }
    }

    // Actual distance covered this frame (post camera-lerp + collision resolution) –
    // used for both facing and animation speed, so visuals match real motion
    // (e.g. facing the slide direction when sliding along a collider).
    const actualDeltaX = resolvedX - currentX
    const actualDeltaZ = resolvedZ - currentZ
    const moveMagnitude = Math.hypot(actualDeltaX, actualDeltaZ)

    // Smoothed speed estimate (world units/sec) drives idle/walk/run switching
    const instantSpeed = delta > 0 ? moveMagnitude / delta : 0
    speedRef.current += (instantSpeed - speedRef.current) * SPEED_SMOOTHING
    characterMotion.speed = speedRef.current

    // Continuously face the direction actually moved (matches the model's -Z default facing)
    if (moveMagnitude > FACING_DEADZONE) {
      targetRotationRef.current = Math.atan2(actualDeltaX, actualDeltaZ)
    }
    groupRef.current.rotation.y = lerpAngle(
      groupRef.current.rotation.y,
      targetRotationRef.current,
      ROTATION_LERP,
    )

    // Switch idle/walk/run animations based on smoothed speed, with hysteresis
    // to avoid flicker at the thresholds. Thresholds are live-tunable via the editor panel.
    const thresholds = useGardenStore.getState().motionThresholds
    const nextState = nextMotionState(motionStateRef.current, speedRef.current, thresholds)
    if (nextState !== motionStateRef.current) {
      const prevClip = clipForState[motionStateRef.current]
      const nextClip = clipForState[nextState]
      motionStateRef.current = nextState
      characterMotion.state = nextState
      if (nextClip !== prevClip) {
        if (prevClip) actions[prevClip]?.fadeOut(0.2)
        if (nextClip) actions[nextClip]?.reset().fadeIn(0.2).play()
      }
    }

    // Expose actual position for other systems
    characterPosition.copy(groupRef.current.position)
  })

  return (
    <Select enabled={TOON_SHADING_ENABLED}>
      <group ref={groupRef} scale={2}>
        <primitive object={scene} />
      </group>
    </Select>
  )
}
