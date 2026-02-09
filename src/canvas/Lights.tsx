import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function Lights() {
  const lightRef = useRef<THREE.DirectionalLight>(null)
  const { camera } = useThree()

  useFrame(() => {
    if (!lightRef.current) return
    // Keep the light centered on the camera's XZ so the shadow
    // frustum always covers the visible area
    lightRef.current.position.set(
      camera.position.x,
      10,
      camera.position.z
    )
    lightRef.current.target.position.set(
      camera.position.x - 5,
      0,
      camera.position.z - 5
    )
    lightRef.current.target.updateMatrixWorld()
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        ref={lightRef}
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-camera-near={0.1}
        shadow-camera-far={100}
      />
    </>
  )
}
