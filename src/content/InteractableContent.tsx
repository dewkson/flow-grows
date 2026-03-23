import { useState, useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ContentArea } from '../data/contentArea'
import { characterPosition } from '../character/characterPosition'
import { useGardenStore } from '../store/gardenStore'
import { TextContent } from './TextContent'
import { EditableTextPanel } from './EditableTextPanel'
import { ContentZone } from './ContentZone'

type InteractableContentProps = {
  data: ContentArea
}

export function InteractableContent({ data }: InteractableContentProps) {
  const [isNearby, setIsNearby] = useState(false)

  const debugZones = useGardenStore((s) => s.debugZones)
  const openEmbedPanel = useGardenStore((s) => s.openEmbedPanel)

  const radius = data.interactionRadius ?? 2.5

  // Per-frame proximity check using the shared mutable characterPosition
  useFrame(() => {
    const dx = characterPosition.x - data.worldPosition[0]
    const dz = characterPosition.z - data.worldPosition[2]
    const dist = Math.sqrt(dx * dx + dz * dz)
    const nearby = dist < radius
    if (nearby !== isNearby) setIsNearby(nearby)
  })

  const handleEmbedClick = useCallback(() => {
    if (isNearby) openEmbedPanel(data.id)
  }, [isNearby, openEmbedPanel, data.id])

  return (
    <group position={data.worldPosition}>
      {/* Rotated sub-group for text (faces camera) */}
      <group rotation={data.rotation ?? [0, 0, 0]}>
        {renderContent(data, isNearby)}
      </group>

      {/* Clickable glow zone for embed content */}
      {(data.contentType === 'embed' || data.contentType === 'game') && (
        <EmbedGlowZone
          radius={radius}
          isNearby={isNearby}
          position={[0, -data.worldPosition[1] + 0.06, 0]}
          onClick={handleEmbedClick}
        />
      )}

      {/* Debug zone on the ground – outside rotation so it stays flat */}
      {debugZones && data.contentType !== 'embed' && (
        <ContentZone
          radius={radius}
          isNearby={isNearby}
          position={[0, -data.worldPosition[1] + 0.05, 0]}
        />
      )}
    </group>
  )
}

/** Glowing ring on the ground for embed zones – clickable when nearby */
function EmbedGlowZone({
  radius,
  isNearby,
  position,
  onClick,
}: {
  radius: number
  isNearby: boolean
  position: [number, number, number]
  onClick: () => void
}) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const GLOW_IDLE = new THREE.Color('#6366f1')
  const GLOW_ACTIVE = new THREE.Color('#a5b4fc')

  useFrame((_state, delta) => {
    if (!matRef.current) return
    const target = isNearby ? GLOW_ACTIVE : GLOW_IDLE
    matRef.current.color.lerp(target, 0.1)
    matRef.current.emissive.lerp(target, 0.1)
    const baseOpacity = isNearby ? 0.6 : 0.3
    const pulse = Math.sin(Date.now() * 0.004) * 0.1
    matRef.current.opacity += (baseOpacity + pulse - matRef.current.opacity) * 0.1 * (delta * 60)
  })

  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={(e) => {
        if (isNearby) {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
    >
      <ringGeometry args={[radius * 0.7, radius, 48]} />
      <meshStandardMaterial
        ref={matRef}
        transparent
        opacity={0.3}
        color={GLOW_IDLE}
        emissive={GLOW_IDLE}
        emissiveIntensity={0.5}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

function renderContent(
  data: ContentArea,
  isNearby: boolean,
) {
  switch (data.contentType) {
    case 'text':
      return <EditableTextPanel data={data} isNearby={isNearby} />
    case 'embed':
      return <EditableTextPanel data={data} isNearby={isNearby} />
    case 'game':
    case 'interactive':
      return <TextContent data={data} isNearby={isNearby} />
    default:
      return null
  }
}
