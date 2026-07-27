import { useGLTF } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useGardenStore } from '../store/gardenStore'
import { MODEL_CATALOG } from '../data/modelCatalog'

const HIGHLIGHT_COLOR = new THREE.Color('#22d3ee')
const IDLE_COLOR = new THREE.Color('#a5f3fc')
const HIGHLIGHT_PADDING = 0.15

function PlacedModelInstance({
  id,
  modelPath,
  position,
  positionY,
  rotationY,
  scale,
  isSelected,
  editorMode,
}: {
  id: string
  modelPath: string
  position: [number, number]
  positionY: number
  rotationY: number
  scale: number
  isSelected: boolean
  editorMode: boolean
}) {
  const selectPlacedModel = useGardenStore((s) => s.selectPlacedModel)
  const updatePlacedModel = useGardenStore((s) => s.updatePlacedModel)
  const setCameraDragLocked = useGardenStore((s) => s.setCameraDragLocked)

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
  // (and drag hitbox) so it hugs the actual mesh regardless of the model's own
  // dimensions/pivot.
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

  // Drag-to-move, same pattern as ColliderSystem's "move" handle: raycast the pointer
  // against the ground plane, track the delta from the drag-start hit, apply it to the
  // model's original position.
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef<{ pointerX: number; pointerZ: number; origPos: [number, number] } | null>(null)
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))

  useEffect(() => {
    return () => setCameraDragLocked(false)
  }, [setCameraDragLocked])

  const onPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!editorMode) return
      e.stopPropagation()
      selectPlacedModel(id)
      setCameraDragLocked(true)

      const hit = new THREE.Vector3()
      e.ray.intersectPlane(groundPlane.current, hit)

      setDragging(true)
      dragStart.current = { pointerX: hit.x, pointerZ: hit.z, origPos: [...position] }
      const target = e.target as (EventTarget & { setPointerCapture?: (id: number) => void }) | null
      target?.setPointerCapture?.(e.pointerId)
    },
    [editorMode, id, position, selectPlacedModel, setCameraDragLocked],
  )

  const onPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!dragging || !dragStart.current) return
      e.stopPropagation()

      const hit = new THREE.Vector3()
      e.ray.intersectPlane(groundPlane.current, hit)
      const dx = hit.x - dragStart.current.pointerX
      const dz = hit.z - dragStart.current.pointerZ
      updatePlacedModel(id, {
        position: [dragStart.current.origPos[0] + dx, dragStart.current.origPos[1] + dz],
      })
    },
    [dragging, id, updatePlacedModel],
  )

  const onPointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!dragging) return
      e.stopPropagation()
      setDragging(false)
      dragStart.current = null
      setCameraDragLocked(false)
      const target = e.target as (EventTarget & { releasePointerCapture?: (id: number) => void }) | null
      target?.releasePointerCapture?.(e.pointerId)
    },
    [dragging, setCameraDragLocked],
  )

  return (
    <group position={[position[0], positionY, position[1]]} rotation={[0, rotationY, 0]} scale={scale}>
      <primitive object={clone} />

      {/* Drag hitbox + selection visual (editor mode only), sized to the model's bounds */}
      {editorMode && (
        <group position={[bounds.center.x, bounds.center.y, bounds.center.z]}>
          <mesh
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onClick={(e) => {
              e.stopPropagation()
              selectPlacedModel(id)
            }}
          >
            <boxGeometry
              args={[bounds.size.x + HIGHLIGHT_PADDING, bounds.size.y + HIGHLIGHT_PADDING, bounds.size.z + HIGHLIGHT_PADDING]}
            />
            <meshBasicMaterial
              ref={fillMatRef}
              color={isSelected ? HIGHLIGHT_COLOR : IDLE_COLOR}
              transparent
              opacity={isSelected ? 0.16 : 0.04}
              depthWrite={false}
            />
          </mesh>
          {isSelected && (
            <lineSegments geometry={highlightEdges}>
              <lineBasicMaterial color={HIGHLIGHT_COLOR} />
            </lineSegments>
          )}
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
          id={m.id}
          modelPath={m.modelPath}
          position={m.position}
          positionY={m.positionY}
          rotationY={m.rotationY}
          scale={m.scale}
          isSelected={editorMode && selectedId === m.id}
          editorMode={editorMode}
        />
      ))}
    </>
  )
}

for (const entry of MODEL_CATALOG) {
  useGLTF.preload(entry.path)
}

