import { useTexture } from '@react-three/drei'
import * as THREE from 'three'


function GroundSprite({
  position,
  url,
  scale = 3,
  stretchFactor = 2, // Anpassen je nach Kamerawinkel
}: {
  position: [number, number, number]
  url: string
  scale?: number
  stretchFactor?: number
}) {
  const texture = useTexture(url)

  return (
    <mesh
      position={[position[0], 0.01, position[2]]}
      rotation={[-Math.PI / 2, 0, Math.PI / 4]} // Rotation um Z entfernt!
      renderOrder={1}
      receiveShadow
    >
      {/* Breite bleibt gleich, Höhe wird gestreckt */}
      <planeGeometry args={[scale, scale * stretchFactor]} />
      <meshStandardMaterial
        map={texture}
        transparent={true}
        alphaTest={0.5}
        depthWrite={false}
        side={THREE.DoubleSide}
        polygonOffset
        polygonOffsetFactor={-1}
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
      <GroundSprite position={[-50, 0, -50]} url="/sprites/music-production-area-transparent.png" scale={20} />
    </>
  )
}

