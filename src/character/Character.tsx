import { Billboard, useTexture } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
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

type FacingDirection = 'front' | 'back' | 'left' | 'right'

export function Character() {
  const meshRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const [facing, setFacing] = useState<FacingDirection>('front')
  const facingRef = useRef<FacingDirection>('front')
  const baseTextures = useTexture({
    front: '/sprites/Character/me front.png',
    back: '/sprites/Character/me back.png',
    left: '/sprites/Character/me left.png',
    right: '/sprites/Character/me right.png',
  })

  const textures = useMemo(() => {
    const front = baseTextures.front.clone()
    const back = baseTextures.back.clone()
    const left = baseTextures.left.clone()
    const right = baseTextures.right.clone()

    front.colorSpace = THREE.SRGBColorSpace
    back.colorSpace = THREE.SRGBColorSpace
    left.colorSpace = THREE.SRGBColorSpace
    right.colorSpace = THREE.SRGBColorSpace

    return { front, back, left, right }
  }, [baseTextures.back, baseTextures.front, baseTextures.left, baseTextures.right])

  useEffect(() => () => {
    textures.front.dispose()
    textures.back.dispose()
    textures.left.dispose()
    textures.right.dispose()
  }, [textures])

  const texture = textures[facing]

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
    const currentX = meshRef.current.position.x
    const currentZ = meshRef.current.position.z
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

    const movementMagnitude = Math.abs(intendedDeltaX) + Math.abs(intendedDeltaZ)

    if (movementMagnitude > 0.01) {
      const nextFacing =
        Math.abs(intendedDeltaX) > Math.abs(intendedDeltaZ)
          ? intendedDeltaX > 0
            ? 'right'
            : 'left'
          : intendedDeltaZ > 0
            ? 'front'
            : 'back'

      if (facingRef.current !== nextFacing) {
        facingRef.current = nextFacing
        setFacing(nextFacing)
      }
    }

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
