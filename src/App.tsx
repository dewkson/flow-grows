import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Scene } from './canvas/Scene'
import { ModeToggle } from './ui/ModeToggle'
import { ColliderPanel } from './ui/ColliderPanel'
import { TriggerPanel } from './ui/TriggerPanel'
import { PlacedModelPanel } from './ui/PlacedModelPanel'
import { EmbedPanel } from './content/EmbedPanel'
import { ClickZonePanel } from './ui/ClickZonePanel'
import { EditorMenu } from './ui/EditorMenu'
import { ContentAreaPanel } from './ui/ContentAreaPanel'
import { GardenSwitcher } from './ui/GardenSwitcher'
import { MotionPanel } from './ui/MotionPanel'
import { FreeCameraToggle } from './ui/FreeCameraToggle'
import { CameraLockToggle } from './ui/CameraLockToggle'
import { CameraPanel } from './ui/CameraPanel'
import { getIsoCameraPosition } from './world/constants'
import { useGardenStore } from './store/gardenStore'

// Read once at module load so the very first frame already matches any persisted camera settings
const initialCameraState = useGardenStore.getState()
const initialCameraPosition = getIsoCameraPosition(initialCameraState.cameraTiltDeg).toArray()
const initialCameraZoom = initialCameraState.cameraZoom

function App() {
  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        orthographic
        camera={{ position: initialCameraPosition, zoom: initialCameraZoom }}
        gl={{ clearColor: '#e7e7e7' }}
        scene={{ background: new THREE.Color('#1a1a2e') }}
        style={{ width: '100vw', height: '100vh', display: 'block' }}
      >
        <Scene />
      </Canvas>
      <ModeToggle />
      <FreeCameraToggle />
      <CameraLockToggle />
      <EditorMenu />
      <ColliderPanel />
      <TriggerPanel />
      <PlacedModelPanel />
      <ClickZonePanel />
      <ContentAreaPanel />
      <EmbedPanel />
      <GardenSwitcher />
      <MotionPanel />
      <CameraPanel />
    </>
  )
}

export default App

