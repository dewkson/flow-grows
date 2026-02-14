import { useGardenStore } from '../store/gardenStore'
import { InteractableContent } from './InteractableContent'

export function WorldContentManager() {
  const contentAreas = useGardenStore((s) => s.contentAreas)

  return (
    <>
      {contentAreas.map((area) => (
        <InteractableContent key={area.id} data={area} />
      ))}
    </>
  )
}
