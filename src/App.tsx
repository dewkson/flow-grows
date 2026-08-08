import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Scene } from './canvas/Scene'
import { ModeToggle } from './ui/ModeToggle'
import { ColliderPanel } from './ui/ColliderPanel'
import { PlacedModelPanel } from './ui/PlacedModelPanel'
import { EmbedPanel } from './content/EmbedPanel'
import { ClickZonePanel } from './ui/ClickZonePanel'
import { EditorMenu } from './ui/EditorMenu'
import { ContentAreaPanel } from './ui/ContentAreaPanel'
import { GardenSwitcher } from './ui/GardenSwitcher'
import { MotionPanel } from './ui/MotionPanel'
import { FreeCameraToggle } from './ui/FreeCameraToggle'

function App() {
  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        orthographic
        camera={{ position: [5, 5 / Math.sqrt(2), 5], zoom: 50 }}
        gl={{ clearColor: '#e7e7e7' }}
        scene={{ background: new THREE.Color('#1a1a2e') }}
        style={{ width: '100vw', height: '100vh', display: 'block' }}
      >
        <Scene />
      </Canvas>
      <ModeToggle />
      <FreeCameraToggle />
      <EditorMenu />
      <ColliderPanel />
      <PlacedModelPanel />
      <ClickZonePanel />
      <ContentAreaPanel />
      <EmbedPanel />
      <GardenSwitcher />
      <MotionPanel />
    </>
  )
}

export default App

