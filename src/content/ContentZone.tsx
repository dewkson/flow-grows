import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type ContentZoneProps = {
  radius: number
  isNearby: boolean
  position?: [number, number, number]
}

const ZONE_COLOR_IDLE = new THREE.Color('#4499ff')
const ZONE_COLOR_ACTIVE = new THREE.Color('#44ff88')

export function ContentZone({
  radius,
  isNearby,
  position = [0, 0, 0],
}: ContentZoneProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame((_state, delta) => {
    if (!matRef.current) return

    // Lerp color between idle and active
    const target = isNearby ? ZONE_COLOR_ACTIVE : ZONE_COLOR_IDLE
    matRef.current.color.lerp(target, 0.1)

    // Pulse opacity
    const baseOpacity = isNearby ? 0.45 : 0.25
    const pulse = Math.sin(Date.now() * 0.003) * 0.08
    matRef.current.opacity += (baseOpacity + pulse - matRef.current.opacity) * 0.1 * (delta * 60)
  })

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 0.85, radius, 48]} />
      <meshStandardMaterial
        ref={matRef}
        transparent
        opacity={0.25}
        color={ZONE_COLOR_IDLE}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}
