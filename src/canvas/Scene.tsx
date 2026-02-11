import { Lights } from './Lights'
import { Ground } from '../world/Ground'
import { Walls } from '../world/Walls'
import { Character } from '../character/Character'
import { CameraController } from './Camera'
import { useWorldPosition } from './WorldContext'
import { useGardenStore } from '../store/gardenStore'
import { GardenArea } from '../world/GardenArea'

export function Scene() {
  const { worldPosition } = useWorldPosition()
  const areas = useGardenStore((s) => s.areas)

  return (
    <>
      <CameraController />
      <Lights />
      <group position={[worldPosition.x, worldPosition.y, worldPosition.z]}>
        <Ground />
        <Walls />
        <Character />
        {areas.map((area) => (
          <GardenArea
            key={area.id}
            size={area.size}
            unlocked={area.unlocked}
            position={[area.position[0], 0.1, area.position[1]]}
          />
        ))}
      </group>
    </>
  )
}
