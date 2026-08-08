import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useGardenStore } from '../store/gardenStore'
import type { Collider } from '../data/collider'

const HANDLE_SIZE = 0.5
const MIN_SIZE = 1
const MIN_RADIUS = 0.5

type DragHandle = 'move' | 'x+' | 'x-' | 'z+' | 'z-' | 'rotate' | 'radius'

/** Rotate a local-space (box-relative) offset into world space, given the box's rotationY */
function localToWorldOffset(rot: number, lx: number, lz: number): [number, number] {
  const cos = Math.cos(rot)
  const sin = Math.sin(rot)
  return [lx * cos + lz * sin, -lx * sin + lz * cos]
}

/** Rotate a world-space offset into the box's local space, given the box's rotationY */
function worldToLocalOffset(rot: number, wx: number, wz: number): [number, number] {
  const cos = Math.cos(rot)
  const sin = Math.sin(rot)
  return [wx * cos - wz * sin, wx * sin + wz * cos]
}

/** Single collider box/cylinder + resize/rotate handles when selected in editor mode */
function ColliderBox({ data }: { data: Collider }) {
  const editorMode = useGardenStore((s) => s.editorMode)
  const activeEditorPanel = useGardenStore((s) => s.activeEditorPanel)
  const selectedId = useGardenStore((s) => s.selectedColliderId)
  const selectCollider = useGardenStore((s) => s.selectCollider)
  const updateCollider = useGardenStore((s) => s.updateCollider)
  const setColliderUndoSnapshot = useGardenStore((s) => s.setColliderUndoSnapshot)
  const removeCollider = useGardenStore((s) => s.removeCollider)
  const setCameraDragLocked = useGardenStore((s) => s.setCameraDragLocked)

  // Grabbing/manipulating a collider requires the Collider tab to be active in the editor menu.
  const canInteract = editorMode && activeEditorPanel === 'colliders'
  const isSelected = canInteract && selectedId === data.id
  const visible = editorMode
  const isBox = data.shape !== 'cylinder'

  const [dragging, setDragging] = useState<null | DragHandle>(null)
  const dragStart = useRef<{
    pointerX: number
    pointerZ: number
    origPos: [number, number]
    origSize: [number, number]
    origRadius: number
  } | null>(null)
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))

  useEffect(() => {
    return () => {
      setCameraDragLocked(false)
    }
  }, [setCameraDragLocked])

  const onPointerDown = useCallback(
    (handle: DragHandle) =>
      (e: ThreeEvent<PointerEvent>) => {
        if (!canInteract) return
        e.stopPropagation()
        selectCollider(data.id)
        setColliderUndoSnapshot(data.id)
        setCameraDragLocked(true)

        const hit = new THREE.Vector3()
        e.ray.intersectPlane(groundPlane.current, hit)

        setDragging(handle)
        dragStart.current = {
          pointerX: hit.x,
          pointerZ: hit.z,
          origPos: [...data.position],
          origSize: [...data.size],
          origRadius: data.radius,
        }
        const target = e.target as (EventTarget & { setPointerCapture?: (id: number) => void }) | null
        target?.setPointerCapture?.(e.pointerId)
      },
    [canInteract, data.id, data.position, data.size, data.radius, selectCollider, setColliderUndoSnapshot, setCameraDragLocked],
  )

  const onPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!dragging || !dragStart.current) return
      e.stopPropagation()

      const hit = new THREE.Vector3()
      e.ray.intersectPlane(groundPlane.current, hit)
      const { origPos, origSize } = dragStart.current
      const rot = data.rotationY

      if (dragging === 'move') {
        const dx = hit.x - dragStart.current.pointerX
        const dz = hit.z - dragStart.current.pointerZ
        updateCollider(data.id, { position: [origPos[0] + dx, origPos[1] + dz] }, { recordUndo: false })
        return
      }

      if (dragging === 'rotate') {
        const angle = Math.atan2(hit.x - origPos[0], hit.z - origPos[1])
        updateCollider(data.id, { rotationY: angle }, { recordUndo: false })
        return
      }

      if (dragging === 'radius') {
        const dist = Math.hypot(hit.x - origPos[0], hit.z - origPos[1])
        updateCollider(data.id, { radius: Math.max(MIN_RADIUS, dist) }, { recordUndo: false })
        return
      }

      // Box resize handles: convert the world-space pointer delta into the box's
      // local (rotated) axes before applying it, so dragging still feels axis-aligned.
      const worldDx = hit.x - dragStart.current.pointerX
      const worldDz = hit.z - dragStart.current.pointerZ
      const [localDx, localDz] = worldToLocalOffset(rot, worldDx, worldDz)

      if (dragging === 'x+') {
        const newW = Math.max(MIN_SIZE, origSize[0] + localDx)
        const [ox, oz] = localToWorldOffset(rot, (newW - origSize[0]) / 2, 0)
        updateCollider(data.id, { size: [newW, origSize[1]], position: [origPos[0] + ox, origPos[1] + oz] }, { recordUndo: false })
      } else if (dragging === 'x-') {
        const newW = Math.max(MIN_SIZE, origSize[0] - localDx)
        const [ox, oz] = localToWorldOffset(rot, -(newW - origSize[0]) / 2, 0)
        updateCollider(data.id, { size: [newW, origSize[1]], position: [origPos[0] + ox, origPos[1] + oz] }, { recordUndo: false })
      } else if (dragging === 'z+') {
        const newD = Math.max(MIN_SIZE, origSize[1] + localDz)
        const [ox, oz] = localToWorldOffset(rot, 0, (newD - origSize[1]) / 2)
        updateCollider(data.id, { size: [origSize[0], newD], position: [origPos[0] + ox, origPos[1] + oz] }, { recordUndo: false })
      } else if (dragging === 'z-') {
        const newD = Math.max(MIN_SIZE, origSize[1] - localDz)
        const [ox, oz] = localToWorldOffset(rot, 0, -(newD - origSize[1]) / 2)
        updateCollider(data.id, { size: [origSize[0], newD], position: [origPos[0] + ox, origPos[1] + oz] }, { recordUndo: false })
      }
    },
    [dragging, data.id, data.rotationY, updateCollider],
  )

  const onPointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!dragging) return
      e.stopPropagation()
      setDragging(null)
      dragStart.current = null
      setCameraDragLocked(false)
      const target = e.target as (EventTarget & { releasePointerCapture?: (id: number) => void }) | null
      target?.releasePointerCapture?.(e.pointerId)
    },
    [dragging, setCameraDragLocked],
  )

  const [w, d] = data.size
  const r = data.radius
  const h = 2 // visual height

  const edgesGeo = useMemo(() => {
    const geo = isBox ? new THREE.BoxGeometry(w, h, d) : new THREE.CylinderGeometry(r, r, h, 24)
    const edges = new THREE.EdgesGeometry(geo)
    geo.dispose()
    return edges
  }, [isBox, w, d, r, h])

  useEffect(() => () => edgesGeo.dispose(), [edgesGeo])

  if (!visible) return null

  const rotateHandleOffset = (isBox ? d / 2 : r) + HANDLE_SIZE * 2

  return (
    <group position={[data.position[0], h / 2, data.position[1]]} rotation={[0, data.rotationY, 0]}>
      {/* Main collision shape visual */}
      <mesh
        onPointerDown={onPointerDown('move')}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={(e) => {
          if (!canInteract) return
          e.stopPropagation()
          selectCollider(data.id)
        }}
      >
        {isBox ? <boxGeometry args={[w, h, d]} /> : <cylinderGeometry args={[r, r, h, 24]} />}
        <meshStandardMaterial
          color={isSelected ? '#ff4444' : '#ff8800'}
          transparent
          opacity={isSelected ? 0.45 : 0.25}
          depthWrite={false}
        />
      </mesh>

      {/* Wireframe overlay */}
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color={isSelected ? '#ff2222' : '#ff6600'} />
      </lineSegments>

      {/* Resize/rotate handles (Collider tab active + selected only) */}
      {canInteract && isSelected && (
        <>
          {isBox ? (
            <>
              {/* X+ handle */}
              <mesh
                position={[w / 2 + HANDLE_SIZE / 2, 0, 0]}
                onPointerDown={onPointerDown('x+')}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              >
                <boxGeometry args={[HANDLE_SIZE, HANDLE_SIZE, HANDLE_SIZE]} />
                <meshStandardMaterial color="#44aaff" />
              </mesh>
              {/* X- handle */}
              <mesh
                position={[-w / 2 - HANDLE_SIZE / 2, 0, 0]}
                onPointerDown={onPointerDown('x-')}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              >
                <boxGeometry args={[HANDLE_SIZE, HANDLE_SIZE, HANDLE_SIZE]} />
                <meshStandardMaterial color="#44aaff" />
              </mesh>
              {/* Z+ handle */}
              <mesh
                position={[0, 0, d / 2 + HANDLE_SIZE / 2]}
                onPointerDown={onPointerDown('z+')}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              >
                <boxGeometry args={[HANDLE_SIZE, HANDLE_SIZE, HANDLE_SIZE]} />
                <meshStandardMaterial color="#44aaff" />
              </mesh>
              {/* Z- handle */}
              <mesh
                position={[0, 0, -d / 2 - HANDLE_SIZE / 2]}
                onPointerDown={onPointerDown('z-')}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              >
                <boxGeometry args={[HANDLE_SIZE, HANDLE_SIZE, HANDLE_SIZE]} />
                <meshStandardMaterial color="#44aaff" />
              </mesh>
              {/* Rotate handle – drag around the box to set rotationY */}
              <mesh
                position={[0, 0, -rotateHandleOffset]}
                onPointerDown={onPointerDown('rotate')}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              >
                <sphereGeometry args={[HANDLE_SIZE / 2, 12, 12]} />
                <meshStandardMaterial color="#44ff88" />
              </mesh>
            </>
          ) : (
            /* Radius handle – drag to resize the cylinder (rotation-invariant) */
            <mesh
              position={[r + HANDLE_SIZE / 2, 0, 0]}
              onPointerDown={onPointerDown('radius')}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              <boxGeometry args={[HANDLE_SIZE, HANDLE_SIZE, HANDLE_SIZE]} />
              <meshStandardMaterial color="#44aaff" />
            </mesh>
          )}

          {/* Delete label */}
          <mesh
            position={[0, h / 2 + 0.6, 0]}
            onClick={(e) => {
              e.stopPropagation()
              removeCollider(data.id)
            }}
          >
            <planeGeometry args={[1.4, 0.6]} />
            <meshBasicMaterial color="#cc0000" />
          </mesh>
        </>
      )}
    </group>
  )
}


/** Renders all colliders + handles ground click to place new ones in editor mode */
export function ColliderSystem() {
  const colliders = useGardenStore((s) => s.colliders)

  return (
    <>
      {colliders.map((c) => (
        <ColliderBox key={c.id} data={c} />
      ))}
    </>
  )
}
