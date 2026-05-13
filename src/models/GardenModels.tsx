import { Billboard, useTexture } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useGardenStore } from '../store/gardenStore'


function GroundSprite({
  position,
  url,
  renderOrder = 9999,
  depthTest = false,
  receiveShadow = true,
}: {
  position: [number, number, number]
  url: string
  renderOrder?: number
  depthTest?: boolean
  receiveShadow?: boolean
}) {
  const baseTexture = useTexture(url)

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

  return (
    <Billboard follow lockX={false} lockY={false} lockZ={false} position={position} renderOrder={renderOrder}>
      <mesh renderOrder={renderOrder} receiveShadow={receiveShadow} scale={40}>
        <planeGeometry args={[aspect, 1]} />
        <meshBasicMaterial
          map={texture}
          transparent={true}
          alphaTest={0.5}
          depthWrite={false}
          depthTest={depthTest}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </Billboard>
  )
}

export function GardenModels() {
  const spriteSetup = useGardenStore((s) => s.spriteSetup)
  return (
    <>
      {spriteSetup.map((config, i) => (
        <GroundSprite key={`${config.url}-${i}`} {...config} />
      ))}
    </>
  )
}

