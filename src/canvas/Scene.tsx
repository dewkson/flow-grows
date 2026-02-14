import { Lights } from './Lights'
import { Ground } from '../world/Ground'
import { Character } from '../character/Character'
import { CameraController } from './Camera'
import { useWorldPosition } from './WorldContext'
import { WorldContentManager } from '../content/WorldContentManager'

export function Scene() {
  const { worldPosition } = useWorldPosition()

  return (
    <>
      <CameraController />
      <Lights />
      <group position={[worldPosition.x, worldPosition.y, worldPosition.z]}>
        <Ground />
        <Character />
        <WorldContentManager />
      </group>
    </>
  )
}
