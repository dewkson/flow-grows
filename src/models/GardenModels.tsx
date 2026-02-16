import { useTexture } from '@react-three/drei'
import * as THREE from 'three'


function GroundSprite({
  position,
  url,
  scale = 3,
}: {
  position: [number, number, number]
  url: string
  scale?: number
}) {
  const texture = useTexture(url)

  return (
    <mesh
      position={[position[0], 0.01, position[2]]}
      rotation={[-Math.atan(0.5), Math.PI / 4, Math.PI/10]}
      renderOrder={1}
      receiveShadow
    >
      <planeGeometry args={[scale, scale]} />
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
    </>
  )
}

