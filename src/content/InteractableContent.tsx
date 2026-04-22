import { useState } from 'react'
import { useFrame } from '@react-three/fiber'
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

  const showHintZones = useGardenStore((s) => s.showHintZones)

  const radius = data.interactionRadius ?? 2.5

  // Per-frame proximity check using the shared mutable characterPosition
  useFrame(() => {
    const dx = characterPosition.x - data.worldPosition[0]
    const dz = characterPosition.z - data.worldPosition[2]
    const dist = Math.sqrt(dx * dx + dz * dz)
    const nearby = dist < radius
    if (nearby !== isNearby) setIsNearby(nearby)
  })

  return (
    <group position={data.worldPosition}>
      {/* Rotated sub-group for text (faces camera) */}
      <group rotation={data.rotation ?? [0, 0, 0]}>
        {renderContent(data, isNearby)}
      </group>

      {/* Debug zone on the ground – outside rotation so it stays flat */}
      {showHintZones && (
        <ContentZone
          radius={radius}
          isNearby={isNearby}
          position={[0, -data.worldPosition[1] + 0.05, 0]}
        />
      )}
    </group>
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
