import { Lights } from './Lights'
import { Ground } from '../world/Ground'
import { Character } from '../character/Character'
import { CameraController } from './Camera'
import { CameraFocus } from './CameraFocus'
import { WorldContentManager } from '../content/WorldContentManager'
import { GardenModels } from '../models/GardenModels'
import { ColliderSystem } from '../world/ColliderSystem'

export function Scene() {
  return (
    <>
      <color attach="background" args={['#9e9e9e']} />
      <CameraController />
      <CameraFocus />
      <Lights />
      <Ground />
      <GardenModels />
      <Character />
      <WorldContentManager />
      <ColliderSystem />
    </>
  )
}
