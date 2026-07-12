import { useGLTF, useAnimations } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { characterPosition } from './characterPosition'
import { resolveCollisions } from './collision'
import { CHARACTER_BOUND } from '../world/constants'
import { useGardenStore } from '../store/gardenStore'

/** Initial camera XZ offset – must match the value in App.tsx */
const INITIAL_CAM_X = 5
const INITIAL_CAM_Z = 5

/** How fast the character catches up (0 = never, 1 = instant) */
const LERP_SPEED = 0.02
const FACING_DEADZONE = 0.01
const AXIS_SWITCH_HYSTERESIS = 1.2
const ROTATION_LERP = 0.12
const WALK_THRESHOLD = 0.02

type FacingDirection = 'front' | 'back' | 'left' | 'right'

// Avaturn.me avatar faces -Z by default.
// Map each game-direction to the Y-rotation that aligns the model with movement.
const FACING_ROTATION: Record<FacingDirection, number> = {
  back:  0,              // moving -Z → keep default -Z facing
  front: Math.PI,        // moving +Z → flip 180°
  left:  Math.PI / 2,    // moving -X → rotate 90°
  right: -Math.PI / 2,   // moving +X → rotate -90°
}

/** Shortest-path angle lerp (handles ±PI wrap-around). */
function lerpAngle(current: number, target: number, t: number): number {
  let delta = target - current
  delta = ((delta % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI
  return current + delta * t
}

function selectFacingFromLerp(
  deltaX: number,
  deltaZ: number,
  currentFacing: FacingDirection,
): FacingDirection {
  const absX = Math.abs(deltaX)
  const absZ = Math.abs(deltaZ)

  if (absX + absZ <= FACING_DEADZONE) return currentFacing

  const isCurrentHorizontal = currentFacing === 'left' || currentFacing === 'right'
  const isCurrentVertical = currentFacing === 'front' || currentFacing === 'back'

  if (isCurrentHorizontal && absZ > absX * AXIS_SWITCH_HYSTERESIS) {
    return deltaZ > 0 ? 'front' : 'back'
  }

  if (isCurrentVertical && absX > absZ * AXIS_SWITCH_HYSTERESIS) {
    return deltaX > 0 ? 'right' : 'left'
  }

  if (absX > absZ) return deltaX > 0 ? 'right' : 'left'
  return deltaZ > 0 ? 'front' : 'back'
}

useGLTF.preload('/models/Character/character.glb')

export function Character() {
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const facingRef = useRef<FacingDirection>('front')
  const targetRotationRef = useRef(FACING_ROTATION.front)
  const isMovingRef = useRef(false)

  const { scene, animations } = useGLTF('/models/Character/character.glb')
  // Bind the mixer directly to the scene so bone track names resolve correctly
  const { actions, names } = useAnimations(animations, scene)

  const idleAnim = useMemo(() => names.find(n => /idle/i.test(n)) ?? names[0], [names])
  const walkAnim = useMemo(() => names.find(n => /walk/i.test(n)), [names])

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
  }, [actions, idleAnim, names])

  useFrame(() => {
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

    const intendedDeltaX = targetX - currentX
    const intendedDeltaZ = targetZ - currentZ

    // Lerp only X and Z – Y (height above ground) stays constant
    groupRef.current.position.x += (targetX - groupRef.current.position.x) * LERP_SPEED
    groupRef.current.position.z += (targetZ - groupRef.current.position.z) * LERP_SPEED

    // Resolve collisions with placed colliders
    const colliders = useGardenStore.getState().colliders
    const [resolvedX, resolvedZ] = resolveCollisions(
      groupRef.current.position.x,
      groupRef.current.position.z,
      colliders,
    )
    groupRef.current.position.x = resolvedX
    groupRef.current.position.z = resolvedZ

    // Update facing & smoothly rotate model toward movement direction
    const nextFacing = selectFacingFromLerp(intendedDeltaX, intendedDeltaZ, facingRef.current)
    if (facingRef.current !== nextFacing) {
      facingRef.current = nextFacing
      targetRotationRef.current = FACING_ROTATION[nextFacing]
    }
    groupRef.current.rotation.y = lerpAngle(
      groupRef.current.rotation.y,
      targetRotationRef.current,
      ROTATION_LERP,
    )

    // Switch idle ↔ walk animations based on movement.
    // Only modify animations when walkAnim exists – otherwise idle runs
    // uninterrupted and reset() never causes a T-pose flash.
    const isMoving = Math.abs(intendedDeltaX) + Math.abs(intendedDeltaZ) > WALK_THRESHOLD
    if (isMoving !== isMovingRef.current) {
      isMovingRef.current = isMoving
      if (walkAnim) {
        if (isMoving) {
          actions[idleAnim]?.fadeOut(0.2)
          actions[walkAnim]?.reset().fadeIn(0.2).play()
        } else {
          actions[walkAnim]?.fadeOut(0.2)
          if (idleAnim) actions[idleAnim]?.reset().fadeIn(0.2).play()
        }
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
