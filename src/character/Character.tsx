import { useRef } from 'react'
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

export function Character() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  useFrame(() => {
    if (!meshRef.current) return

    // Freeze movement when embed panel is open
    if (useGardenStore.getState().isEmbedOpen) {
      characterPosition.copy(meshRef.current.position)
      return
    }

    // The camera's ground-center is its XZ position minus the initial offset,
    // clamped so the sphere stays inside the walls (accounting for radius + wall thickness)
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

    // Lerp only X and Z – Y (height above ground) stays constant
    meshRef.current.position.x += (targetX - meshRef.current.position.x) * LERP_SPEED
    meshRef.current.position.z += (targetZ - meshRef.current.position.z) * LERP_SPEED

    // Resolve collisions with placed colliders
    const colliders = useGardenStore.getState().colliders
    const [resolvedX, resolvedZ] = resolveCollisions(
      meshRef.current.position.x,
      meshRef.current.position.z,
      colliders,
    )
    meshRef.current.position.x = resolvedX
    meshRef.current.position.z = resolvedZ

    // Expose actual position for other systems
    characterPosition.copy(meshRef.current.position)
  })

  return (
    <mesh ref={meshRef} position={[0, Math.PI / 2, 0]} renderOrder={10000} castShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#f88a0c" transparent depthTest={false} depthWrite={false} />
    </mesh>
  )
}
