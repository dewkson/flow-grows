import { useRef, useState, useCallback } from 'react'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useGardenStore } from '../store/gardenStore'
import type { Collider } from '../data/collider'

const HANDLE_SIZE = 0.5
const MIN_SIZE = 1

/** Single collider box + resize handles when selected in editor mode */
function ColliderBox({ data }: { data: Collider }) {
  const editorMode = useGardenStore((s) => s.editorMode)
  const selectedId = useGardenStore((s) => s.selectedColliderId)
  const selectCollider = useGardenStore((s) => s.selectCollider)
  const updateCollider = useGardenStore((s) => s.updateCollider)
  const removeCollider = useGardenStore((s) => s.removeCollider)

  const isSelected = selectedId === data.id
  const visible = editorMode

  const [dragging, setDragging] = useState<null | 'move' | 'x+' | 'x-' | 'z+' | 'z-'>(null)
  const dragStart = useRef<{ pointerX: number; pointerZ: number; origPos: [number, number]; origSize: [number, number] } | null>(null)
  const { camera, raycaster, gl } = useThree()

  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))

  const getGroundPoint = useCallback(
    (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(mouse, camera)
      const hit = new THREE.Vector3()
      raycaster.ray.intersectPlane(groundPlane.current, hit)
      return hit
    },
    [camera, raycaster, gl],
  )

  const onPointerDown = useCallback(
    (handle: 'move' | 'x+' | 'x-' | 'z+' | 'z-') =>
      (e: ThreeEvent<PointerEvent>) => {
        if (!editorMode) return
        e.stopPropagation()
        selectCollider(data.id)
        setDragging(handle)
        dragStart.current = {
          pointerX: e.point.x,
          pointerZ: e.point.z,
          origPos: [...data.position],
          origSize: [...data.size],
        }
        gl.domElement.setPointerCapture(e.pointerId)
      },
    [editorMode, data.id, data.position, data.size, selectCollider, gl],
  )

  const onPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!dragging || !dragStart.current) return
      e.stopPropagation()

      const hit = getGroundPoint(e.nativeEvent)
      const dx = hit.x - dragStart.current.pointerX
      const dz = hit.z - dragStart.current.pointerZ
      const { origPos, origSize } = dragStart.current

      if (dragging === 'move') {
        updateCollider(data.id, { position: [origPos[0] + dx, origPos[1] + dz] })
      } else if (dragging === 'x+') {
        const newW = Math.max(MIN_SIZE, origSize[0] + dx)
        updateCollider(data.id, {
          size: [newW, origSize[1]],
          position: [origPos[0] + (newW - origSize[0]) / 2, origPos[1]],
        })
      } else if (dragging === 'x-') {
        const newW = Math.max(MIN_SIZE, origSize[0] - dx)
        updateCollider(data.id, {
          size: [newW, origSize[1]],
          position: [origPos[0] - (newW - origSize[0]) / 2, origPos[1]],
        })
      } else if (dragging === 'z+') {
        const newD = Math.max(MIN_SIZE, origSize[1] + dz)
        updateCollider(data.id, {
          size: [origSize[0], newD],
          position: [origPos[0], origPos[1] + (newD - origSize[1]) / 2],
        })
      } else if (dragging === 'z-') {
        const newD = Math.max(MIN_SIZE, origSize[1] - dz)
        updateCollider(data.id, {
          size: [origSize[0], newD],
          position: [origPos[0], origPos[1] - (newD - origSize[1]) / 2],
        })
      }
    },
    [dragging, data.id, getGroundPoint, updateCollider],
  )

  const onPointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!dragging) return
      e.stopPropagation()
      setDragging(null)
      dragStart.current = null
      gl.domElement.releasePointerCapture(e.pointerId)
    },
    [dragging, gl],
  )

  if (!visible) return null

  const [w, d] = data.size
  const h = 2 // visual height

  return (
    <group position={[data.position[0], h / 2, data.position[1]]}>
      {/* Main collision box visual */}
      <mesh
        onPointerDown={onPointerDown('move')}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={(e) => {
          if (!editorMode) return
          e.stopPropagation()
          selectCollider(data.id)
        }}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={isSelected ? '#ff4444' : '#ff8800'}
          transparent
          opacity={isSelected ? 0.45 : 0.25}
          depthWrite={false}
        />
      </mesh>

      {/* Wireframe overlay */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(w, h, d)]} />
        <lineBasicMaterial color={isSelected ? '#ff2222' : '#ff6600'} />
      </lineSegments>

      {/* Resize handles (editor only, selected only) */}
      {editorMode && isSelected && (
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
