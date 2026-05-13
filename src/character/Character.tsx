import { Billboard, useTexture } from '@react-three/drei'
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

export function Character() {
  const meshRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const baseTexture = useTexture('/sprites/me.png')

  const texture = useMemo(() => {
    const clonedTexture = baseTexture.clone()
    clonedTexture.colorSpace = THREE.SRGBColorSpace
    return clonedTexture
  }, [baseTexture])

  useEffect(() => () => {
    texture.dispose()
  }, [texture])

  const textureImage = texture.image as { width: number; height: number } | undefined
  const textureWidth = textureImage?.width ?? 1
  const textureHeight = textureImage?.height ?? 1
  const aspect = textureWidth / textureHeight

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
    <group ref={meshRef} position={[0, Math.PI / 2, 0]}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh renderOrder={10000} scale={3}>
          <planeGeometry args={[aspect * 2, 2]} />
          <meshBasicMaterial
            map={texture}
            transparent
            alphaTest={0.5}
            depthTest={false}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
    </group>
  )
}
