import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useGardenStore } from '../store/gardenStore'
import { MODEL_CATALOG } from '../data/modelCatalog'

const HIGHLIGHT_COLOR = new THREE.Color('#22d3ee')
const HIGHLIGHT_PADDING = 0.15

function PlacedModelInstance({
  modelPath,
  position,
  positionY,
  rotationY,
  scale,
  isSelected,
}: {
  modelPath: string
  position: [number, number]
  positionY: number
  rotationY: number
  scale: number
  isSelected: boolean
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

  // Local-space bounding box of the model, used to size/place the selection highlight
  // so it hugs the actual mesh regardless of the model's own dimensions/pivot.
  const bounds = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    return { size, center }
  }, [clone])

  const highlightEdges = useMemo(() => {
    const box = new THREE.BoxGeometry(
      bounds.size.x + HIGHLIGHT_PADDING,
      bounds.size.y + HIGHLIGHT_PADDING,
      bounds.size.z + HIGHLIGHT_PADDING,
    )
    const edges = new THREE.EdgesGeometry(box)
    box.dispose()
    return edges
  }, [bounds])

  useEffect(() => () => highlightEdges.dispose(), [highlightEdges])

  const fillMatRef = useRef<THREE.MeshBasicMaterial>(null)

  // Gentle pulse so the highlight stays noticeable even against similarly colored models.
  useFrame(({ clock }) => {
    if (!isSelected || !fillMatRef.current) return
    fillMatRef.current.opacity = 0.16 + Math.sin(clock.elapsedTime * 3) * 0.08
  })

  return (
    <group position={[position[0], positionY, position[1]]} rotation={[0, rotationY, 0]} scale={scale}>
      <primitive object={clone} />
      {isSelected && (
        <group position={[bounds.center.x, bounds.center.y, bounds.center.z]}>
          <mesh>
            <boxGeometry
              args={[bounds.size.x + HIGHLIGHT_PADDING, bounds.size.y + HIGHLIGHT_PADDING, bounds.size.z + HIGHLIGHT_PADDING]}
            />
            <meshBasicMaterial ref={fillMatRef} color={HIGHLIGHT_COLOR} transparent opacity={0.16} depthWrite={false} />
          </mesh>
          <lineSegments geometry={highlightEdges}>
            <lineBasicMaterial color={HIGHLIGHT_COLOR} />
          </lineSegments>
        </group>
      )}
    </group>
  )
}

/** Renders every model freely placed by the editor at its saved ground position/rotation. */
export function PlacedModels() {
  const placedModels = useGardenStore((s) => s.placedModels)
  const editorMode = useGardenStore((s) => s.editorMode)
  const selectedId = useGardenStore((s) => s.selectedPlacedModelId)

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
          isSelected={editorMode && selectedId === m.id}
        />
      ))}
    </>
  )
}

for (const entry of MODEL_CATALOG) {
  useGLTF.preload(entry.path)
}
