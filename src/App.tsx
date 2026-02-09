import { Canvas } from '@react-three/fiber'
import { Scene } from './canvas/Scene'
import { WorldProvider } from './canvas/WorldContext'

function App() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      orthographic
      camera={{ position: [5, 5 / Math.sqrt(2), 5], zoom: 50 }}
      style={{ width: '100vw', height: '100vh', display: 'block' }}
    >
      <WorldProvider>
        <Scene />
      </WorldProvider>
    </Canvas>
  )
}

export default App

