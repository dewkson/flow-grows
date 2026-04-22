import { useGardenStore } from '../store/gardenStore'
import { InteractableContent } from './InteractableContent'
import { ClickZoneHotspot } from './ClickZoneHotspots'

export function WorldContentManager() {
  const contentAreas = useGardenStore((s) => s.contentAreas)
  const linkedClickZones = useGardenStore((s) => s.linkedClickZones)

  const resolvedZones = linkedClickZones
    .map((zone) => {
      const linkedArea = contentAreas.find((area) => area.id === zone.linkedContentId)
      if (!linkedArea) return null
      return { zone, linkedArea }
    })
    .filter((entry): entry is { zone: (typeof linkedClickZones)[number]; linkedArea: (typeof contentAreas)[number] } => entry !== null)

  return (
    <>
      {contentAreas.map((area) => (
        <InteractableContent key={area.id} data={area} />
      ))}
      {resolvedZones.map((entry) => (
        <ClickZoneHotspot key={entry.zone.id} zone={entry.zone} linkedArea={entry.linkedArea} />
      ))}
    </>
  )
}
