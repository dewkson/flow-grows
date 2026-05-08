import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useGardenStore } from '../store/gardenStore'


function GroundSprite({
  position,
  url,
  scale = 3,
  stretchFactor = 2, // Anpassen je nach Kamerawinkel
  renderOrder = 1,
  depthTest = true,
  receiveShadow = true,
}: {
  position: [number, number, number]
  url: string
  scale?: number
  stretchFactor?: number
  renderOrder?: number
  depthTest?: boolean
  receiveShadow?: boolean
}) {
  const texture = useTexture(url)

  // Schärfere Darstellung: kein Mipmap-Blur, anisotropes Filtering für schräge Ansicht
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.anisotropy = 16
  texture.colorSpace = THREE.SRGBColorSpace

  return (
    <mesh
      position={[position[0], 0.01, position[2]]}
      rotation={[-Math.PI / 2, 0, Math.PI / 4]} // Rotation um Z entfernt!
      renderOrder={renderOrder}
      receiveShadow={receiveShadow}
    >
      {/* Breite bleibt gleich, Höhe wird gestreckt */}
      <planeGeometry args={[scale, scale * stretchFactor]} />
      <meshStandardMaterial
        map={texture}
        transparent={true}
        alphaTest={0.5}
        depthWrite={false}
        depthTest={depthTest}
        side={THREE.DoubleSide}
        polygonOffset
        polygonOffsetFactor={-1}
        toneMapped={false}
      />
    </mesh>
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

