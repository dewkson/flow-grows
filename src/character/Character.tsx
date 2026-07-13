import { useGLTF, useAnimations } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { characterPosition } from './characterPosition'
import { characterMotion } from './characterMotion'
import { resolveCollisions } from './collision'
import { CHARACTER_BOUND } from '../world/constants'
import { useGardenStore, type MotionThresholds } from '../store/gardenStore'

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

  // Start idle animation – depend on names so this fires once animations are ready
  useEffect(() => {
    if (!idleAnim) return
    actions[idleAnim]?.reset().play()
    motionStateRef.current = 'idle'
    characterMotion.state = 'idle'
  }, [actions, idleAnim, names])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    // Freeze movement when embed panel is open
    if (useGardenStore.getState().isEmbedOpen) {
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

    // Lerp only X and Z – Y (height above ground) stays constant
    let stepX = (targetX - groupRef.current.position.x) * lerpSpeed
    let stepZ = (targetZ - groupRef.current.position.z) * lerpSpeed

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
    const colliders = useGardenStore.getState().colliders
    const [resolvedX, resolvedZ] = resolveCollisions(
      groupRef.current.position.x,
      groupRef.current.position.z,
      colliders,
    )
    groupRef.current.position.x = resolvedX
    groupRef.current.position.z = resolvedZ

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
    <group ref={groupRef} scale={2}>
      <primitive object={scene} />
    </group>
  )
}
