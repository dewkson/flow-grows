import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { characterPosition } from '../character/characterPosition'

type GardenAreaProps = {
  size: number
  unlocked: boolean
  position: [number, number, number]
}

export function GardenArea({ size, unlocked, position }: GardenAreaProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)

  const colorUnlocked = new THREE.Color('#3da34d')
  const colorUnlockedHover = new THREE.Color('#5ec46a')
  const colorLocked = new THREE.Color('#4a4a4a')
  const colorLockedHover = new THREE.Color('#6b6b6b')

  useFrame(() => {
    if (!matRef.current) return

    // Use actual character position (updated by Character.tsx every frame)
    const dx = characterPosition.x - position[0]
    const dz = characterPosition.z - position[2]
    const dist = Math.sqrt(dx * dx + dz * dz)
    const isOver = dist < size

    const target = unlocked
      ? isOver ? colorUnlockedHover : colorUnlocked
      : isOver ? colorLockedHover : colorLocked

    matRef.current.color.lerp(target, 0.1)
  })

  return (
    <mesh position={position} receiveShadow>
      <cylinderGeometry args={[size, size, 0.1, 32]} />
      <meshStandardMaterial ref={matRef} />
    </mesh>
  )
}
