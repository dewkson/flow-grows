import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import { useGardenStore } from '../store/gardenStore'
import { MODEL_CATALOG } from '../data/modelCatalog'

function PlacedModelInstance({
  modelPath,
  position,
  positionY,
  rotationY,
  scale,
}: {
  modelPath: string
  position: [number, number]
  positionY: number
  rotationY: number
  scale: number
}) {
  const { scene } = useGLTF(modelPath)

  const clone = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return
      const mesh = obj as THREE.Mesh
      mesh.castShadow = true
      mesh.receiveShadow = true
    })
    return c
  }, [scene])

  return (
    <primitive
      object={clone}
      position={[position[0], positionY, position[1]]}
      rotation={[0, rotationY, 0]}
      scale={scale}
    />
  )
}

/** Renders every model freely placed by the editor at its saved ground position/rotation. */
export function PlacedModels() {
  const placedModels = useGardenStore((s) => s.placedModels)

  return (
    <>
      {placedModels.map((m) => (
        <PlacedModelInstance
          key={m.id}
          modelPath={m.modelPath}
          position={m.position}
          positionY={m.positionY}
          rotationY={m.rotationY}
          scale={m.scale}
        />
      ))}
    </>
  )
}

for (const entry of MODEL_CATALOG) {
  useGLTF.preload(entry.path)
}
