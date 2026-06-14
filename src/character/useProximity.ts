import { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { characterPosition } from './characterPosition'

export function useProximity(worldPosition: [number, number, number], radius: number): boolean {
  const [isNearby, setIsNearby] = useState(false)

  useFrame(() => {
    const dx = characterPosition.x - worldPosition[0]
    const dz = characterPosition.z - worldPosition[2]
    const nearby = dx * dx + dz * dz < radius * radius
    if (nearby !== isNearby) setIsNearby(nearby)
  })

  return isNearby
}
