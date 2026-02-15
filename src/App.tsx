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
      gl={{ clearColor: '#e7e7e7' }}       {/* oder: */}
      scene={{ background: new THREE.Color('#1a1a2e') }}
      style={{ width: '100vw', height: '100vh', display: 'block' }}
    >
      <WorldProvider>
        <Scene />
      </WorldProvider>
    </Canvas>
  )
}

export default App

