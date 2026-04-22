import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { ClickZone, ContentArea, LinkedClickZone } from '../data/contentArea'
import { characterPosition } from '../character/characterPosition'
import { useGardenStore } from '../store/gardenStore'

type ClickZoneHotspotProps = {
  zone: LinkedClickZone
  linkedArea: ContentArea
}

export function ClickZoneHotspot({ zone, linkedArea }: ClickZoneHotspotProps) {
  const showHotspotZones = useGardenStore((s) => s.showHotspotZones)
  const editorMode = useGardenStore((s) => s.editorMode)
  const openEmbedPanel = useGardenStore((s) => s.openEmbedPanel)
  const setActiveContent = useGardenStore((s) => s.setActiveContent)
  const updateLinkedClickZoneShape = useGardenStore((s) => s.updateLinkedClickZoneShape)
  const setCameraDragLocked = useGardenStore((s) => s.setCameraDragLocked)

  const [isNearby, setIsNearby] = useState(false)
  const radius = linkedArea.interactionRadius ?? 2.5

  useFrame(() => {
    const dx = characterPosition.x - linkedArea.worldPosition[0]
    const dz = characterPosition.z - linkedArea.worldPosition[2]
    const dist = Math.sqrt(dx * dx + dz * dz)
    const nearby = dist < radius
    if (nearby !== isNearby) setIsNearby(nearby)
  })

  const handleClick = useCallback(() => {
    if (editorMode) return
    if (!isNearby) return
    if (linkedArea.contentType === 'embed' || linkedArea.contentType === 'game') {
      openEmbedPanel(linkedArea.id)
      return
    }
    setActiveContent(linkedArea.id)
  }, [editorMode, isNearby, linkedArea.contentType, linkedArea.id, openEmbedPanel, setActiveContent])

  const handleZoneChange = useCallback(
    (patch: Partial<ClickZone>) => {
      updateLinkedClickZoneShape(zone.id, patch)
    },
    [zone.id, updateLinkedClickZoneShape],
  )

  useEffect(() => {
    return () => {
      setCameraDragLocked(false)
    }
  }, [setCameraDragLocked])

  return (
    <group position={linkedArea.worldPosition}>
      <EditableHotspotShape
        radius={radius}
        clickZone={zone.clickZone}
        isNearby={isNearby}
        debugVisible={showHotspotZones}
        editorMode={editorMode}
        onChange={handleZoneChange}
        onDragStateChange={setCameraDragLocked}
        onClick={handleClick}
      />
    </group>
  )
}

function EditableHotspotShape({
  radius,
  clickZone,
  isNearby,
  debugVisible,
  editorMode,
  onChange,
  onDragStateChange,
  onClick,
}: {
  radius: number
  clickZone: ClickZone
  isNearby: boolean
  debugVisible: boolean
  editorMode: boolean
  onChange: (patch: Partial<ClickZone>) => void
  onDragStateChange: (dragging: boolean) => void
  onClick: () => void
}) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const isDraggingWorldRef = useRef(false)
  const isDraggingScreenRef = useRef(false)
  const screenDragStartRef = useRef<{ mouseX: number; mouseY: number; baseX: number; baseY: number } | null>(null)
  const DEBUG_IDLE = new THREE.Color('#0ea5e9')
  const DEBUG_ACTIVE = new THREE.Color('#38bdf8')

  const space = clickZone.space ?? 'world'
  const position = useMemo<[number, number, number]>(
    () => clickZone.offset ?? [0, -0.06, 0],
    [clickZone.offset],
  )
  const shape = clickZone.shape ?? 'circle'
  const zoneRadius = clickZone.radius ?? radius * 0.72
  const zoneSize = clickZone.size ?? [radius * 1.6, radius * 1.6]
  const screenOffset = useMemo<[number, number]>(
    () => clickZone.screenOffset ?? [0, 0],
    [clickZone.screenOffset],
  )
  const screenRadius = clickZone.screenRadius ?? Math.max(24, radius * 8)
  const screenSize = clickZone.screenSize ?? [Math.max(56, radius * 16), Math.max(56, radius * 16)]

  const handleWorldPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!editorMode) return
    e.stopPropagation()
    isDraggingWorldRef.current = true
    onDragStateChange(true)
    const target = e.target as (EventTarget & { setPointerCapture?: (id: number) => void }) | null
    target?.setPointerCapture?.(e.pointerId)
    document.body.style.cursor = 'grabbing'
  }, [editorMode, onDragStateChange])

  const handleWorldPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!editorMode || !isDraggingWorldRef.current) return
    e.stopPropagation()
    const hit = e.point
    onChange({
      offset: [
        Math.round(hit.x * 100) / 100,
        position[1],
        Math.round(hit.z * 100) / 100,
      ],
    })
  }, [editorMode, onChange, position])

  const handleWorldPointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!editorMode) return
    e.stopPropagation()
    isDraggingWorldRef.current = false
    onDragStateChange(false)
    const target = e.target as (EventTarget & { releasePointerCapture?: (id: number) => void }) | null
    target?.releasePointerCapture?.(e.pointerId)
    document.body.style.cursor = 'auto'
  }, [editorMode, onDragStateChange])

  const handleScreenMouseMove = useCallback((event: MouseEvent) => {
    const start = screenDragStartRef.current
    if (!start || !editorMode) return
    const dx = event.clientX - start.mouseX
    const dy = event.clientY - start.mouseY
    onChange({
      screenOffset: [
        Math.round((start.baseX + dx) * 100) / 100,
        Math.round((start.baseY + dy) * 100) / 100,
      ],
    })
  }, [editorMode, onChange])

  const stopScreenDrag = useCallback(() => {
    if (!isDraggingScreenRef.current) return
    isDraggingScreenRef.current = false
    screenDragStartRef.current = null
    onDragStateChange(false)
    window.removeEventListener('mousemove', handleScreenMouseMove)
    document.body.style.cursor = 'auto'
  }, [handleScreenMouseMove, onDragStateChange])

  useEffect(() => {
    return () => {
      onDragStateChange(false)
      window.removeEventListener('mousemove', handleScreenMouseMove)
      document.body.style.cursor = 'auto'
    }
  }, [handleScreenMouseMove, onDragStateChange])

  const startScreenDrag = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!editorMode) return
    e.preventDefault()
    e.stopPropagation()
    isDraggingScreenRef.current = true
    onDragStateChange(true)
    screenDragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      baseX: screenOffset[0],
      baseY: screenOffset[1],
    }
    window.addEventListener('mousemove', handleScreenMouseMove)
    window.addEventListener('mouseup', stopScreenDrag, { once: true })
    document.body.style.cursor = 'grabbing'
  }, [editorMode, handleScreenMouseMove, stopScreenDrag, screenOffset, onDragStateChange])

  useFrame((_state, delta) => {
    if (!matRef.current) return

    const target = isNearby ? DEBUG_ACTIVE : DEBUG_IDLE
    matRef.current.color.lerp(target, 0.1)
    matRef.current.emissive.lerp(target, 0.1)
    const baseOpacity = debugVisible ? (isNearby ? 0.28 : 0.14) : 0
    const pulse = debugVisible ? Math.sin(Date.now() * 0.004) * 0.05 : 0
    matRef.current.opacity += (baseOpacity + pulse - matRef.current.opacity) * 0.1 * (delta * 60)
  })

  if (space === 'screen') {
    const width = shape === 'circle' ? screenRadius * 2 : screenSize[0]
    const height = shape === 'circle' ? screenRadius * 2 : screenSize[1]

    return (
      <Html position={[0, 0, 0]} center zIndexRange={[1200, 1300]}>
        <button
          type="button"
          aria-label="Open content"
          data-no-camera-drag="true"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          onMouseDown={startScreenDrag}
          onMouseEnter={() => {
            if (editorMode) {
              document.body.style.cursor = 'grab'
              return
            }
            document.body.style.cursor = isNearby ? 'pointer' : 'not-allowed'
          }}
          onMouseLeave={() => {
            if (!isDraggingScreenRef.current) document.body.style.cursor = 'auto'
          }}
          style={{
            width,
            height,
            transform: `translate(${screenOffset[0]}px, ${screenOffset[1]}px)`,
            borderRadius: shape === 'circle' ? 9999 : 8,
            border: debugVisible ? `2px solid ${isNearby ? '#38bdf8' : '#0ea5e9'}` : 'none',
            background: debugVisible ? (isNearby ? 'rgba(56, 189, 248, 0.22)' : 'rgba(14, 165, 233, 0.15)') : 'transparent',
            outline: 'none',
            cursor: isNearby ? 'pointer' : 'not-allowed',
            padding: 0,
            pointerEvents: 'auto',
            boxSizing: 'border-box',
          }}
        />
      </Html>
    )
  }

  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={999}
      onPointerDown={handleWorldPointerDown}
      onPointerMove={handleWorldPointerMove}
      onPointerUp={handleWorldPointerUp}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={(e) => {
        if (editorMode) {
          e.stopPropagation()
          document.body.style.cursor = 'grab'
          return
        }
        if (isNearby) {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }
      }}
      onPointerOut={() => {
        if (!isDraggingWorldRef.current) document.body.style.cursor = 'auto'
      }}
    >
      {shape === 'rect' ? (
        <planeGeometry args={zoneSize} />
      ) : (
        <circleGeometry args={[zoneRadius, 48]} />
      )}
      <meshStandardMaterial
        ref={matRef}
        transparent
        opacity={0}
        color={DEBUG_IDLE}
        emissive={DEBUG_IDLE}
        emissiveIntensity={0.15}
        side={THREE.DoubleSide}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}
