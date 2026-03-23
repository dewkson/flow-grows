import { useTexture } from '@react-three/drei'
import * as THREE from 'three'


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
  return (
    <>
      {/* Bonsai zentral */}
      {/*<Bonsai position={[0, 0, 0]} /> */}

      {/* Grass zentral + ein Clone versetzt */}
      {/*<Grass position={[2, 0, 1]} /> */}
      {/*<Grass position={[-4, 0, -3]} /> */}

      {/* 2D Sprite auf dem Boden */}
      <GroundSprite position={[0, 0, 0]} url="/sprites/origin-tree-transparent.png" scale={30} />
      <GroundSprite position={[0, 0, 0]} url="/sprites/origin-tree-solo.png" scale={30} renderOrder={3} depthTest={false} receiveShadow={false} />
      <GroundSprite position={[-52, 0, -52]} url="/sprites/music-production-area-transparent.png" scale={20} />
      <GroundSprite position={[-20, 0, 0]} url="/sprites/path-isles.png" scale={20} />
      <GroundSprite position={[30, 0, -30]} url="/sprites/game-dev-area.png" scale={30} />
    </>
  )
}

