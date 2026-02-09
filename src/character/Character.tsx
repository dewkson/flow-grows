import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

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

    // The camera's ground-center is its XZ position minus the initial offset
    const targetX = camera.position.x - INITIAL_CAM_X
    const targetZ = camera.position.z - INITIAL_CAM_Z

    // Lerp only X and Z – Y (height above ground) stays constant
    meshRef.current.position.x += (targetX - meshRef.current.position.x) * LERP_SPEED
    meshRef.current.position.z += (targetZ - meshRef.current.position.z) * LERP_SPEED
  })

  return (
    <mesh ref={meshRef} position={[0, Math.PI / 2, 0]} castShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#f88a0c" />
    </mesh>
  )
}
