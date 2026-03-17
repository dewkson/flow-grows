import { Lights } from './Lights'
import { Ground } from '../world/Ground'
import { Character } from '../character/Character'
import { CameraController } from './Camera'
import { useWorldPosition } from './WorldContext'
import { WorldContentManager } from '../content/WorldContentManager'
import { GardenModels } from '../models/GardenModels'
import { ColliderSystem } from '../world/ColliderSystem'

export function Scene() {
  const { worldPosition } = useWorldPosition()

  return (
    <>
      <color attach="background" args={['#9e9e9e']} />
      <CameraController />
      <Lights />
      <group position={[worldPosition.x, worldPosition.y, worldPosition.z]}>
        <Ground />
        <GardenModels />
        <Character />
        <WorldContentManager />
        <ColliderSystem />
      </group>
    </>
  )
}
