import type { ContentArea } from '../data/contentArea'
import { useGardenStore } from '../store/gardenStore'
import { useProximity } from '../character/useProximity'
import { TextContent } from './TextContent'
import { EditableTextPanel } from './EditableTextPanel'
import { ContentZone } from './ContentZone'

type InteractableContentProps = {
  data: ContentArea
}

export function InteractableContent({ data }: InteractableContentProps) {
  const showHintZones = useGardenStore((s) => s.showHintZones)
  const hintsEnabled = useGardenStore((s) => s.hintsEnabled)
  const radius = data.interactionRadius ?? 2.5
  const isNearby = useProximity(data.worldPosition, radius)
  const showContent = isNearby && hintsEnabled

  return (
    <group position={data.worldPosition}>
      {/* Rotated sub-group for text (faces camera) */}
      <group rotation={data.rotation ?? [0, 0, 0]}>
        {renderContent(data, showContent)}
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
