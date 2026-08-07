import { EffectComposer, Outline, Selection } from '@react-three/postprocessing'
import { Lights } from './Lights'
import { Ground } from '../world/Ground'
import { Character } from '../character/Character'
import { CameraController } from './Camera'
import { CameraFocus } from './CameraFocus'
import { WorldContentManager } from '../content/WorldContentManager'
import { GardenModels } from '../models/GardenModels'
import { PlacedModels } from '../models/PlacedModels'
import { ColliderSystem } from '../world/ColliderSystem'

export function Scene() {
  return (
    <Selection>
      <color attach="background" args={['#a8d4f0']} />
      <CameraController />
      <CameraFocus />
      <Lights />
      <Ground />
      <GardenModels />
      <PlacedModels />
      <Character />
      <WorldContentManager />
      <ColliderSystem />
      <EffectComposer autoClear={false}>
        <Outline blur visibleEdgeColor={0x000000} edgeStrength={40} width={1000} />
      </EffectComposer>
    </Selection>
  )
}
