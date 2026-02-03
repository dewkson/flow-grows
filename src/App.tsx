import { Canvas } from '@react-three/fiber'
import { Scene } from './canvas/Scene'
import { WorldProvider } from './canvas/WorldContext'

function App() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 5, 8] }}
      style={{ width: '100vw', height: '100vh', display: 'block' }}
    >
      <WorldProvider>
        <Scene />
      </WorldProvider>
    </Canvas>
  )
}

export default App

