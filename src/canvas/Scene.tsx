import { EffectComposer, Outline, Selection } from '@react-three/postprocessing'
import { Lights } from './Lights'
import { Ground } from '../world/Ground'
import { Character } from '../character/Character'
import { CameraController } from './Camera'
import { CameraFocus } from './CameraFocus'
import { FreeCameraController } from './FreeCameraController'
import { WorldContentManager } from '../content/WorldContentManager'
import { GardenModels } from '../models/GardenModels'
import { PlacedModels } from '../models/PlacedModels'
import { ColliderSystem } from '../world/ColliderSystem'
import { useGardenStore } from '../store/gardenStore'

export function Scene() {
  const freeCameraMode = useGardenStore((s) => s.freeCameraMode)

  return (
    <Selection>
      <color attach="background" args={['#a8d4f0']} />
      <CameraController />
      <CameraFocus />
      {freeCameraMode && <FreeCameraController />}
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
