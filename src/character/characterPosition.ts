import * as THREE from 'three'
import { useEffect, useState } from 'react'

/**
 * Shared mutable vector updated by Character every frame.
 * Other systems (e.g. GardenArea) can read this without causing re-renders.
 */
export const characterPosition = new THREE.Vector3()

/**
 * Polls the character's live XZ position on an interval, for plain HTML overlay UIs
 * (outside the R3F tree, e.g. editor panels) that need to react to movement — such as
 * filtering an editing list down to nearby items. Only polls while `enabled` is true.
 */
export function usePolledCharacterPosition(enabled: boolean, intervalMs = 200): { x: number; z: number } {
  const [pos, setPos] = useState({ x: characterPosition.x, z: characterPosition.z })

  useEffect(() => {
    if (!enabled) return
    const interval = setInterval(() => {
      setPos((prev) => {
        if (prev.x === characterPosition.x && prev.z === characterPosition.z) return prev
        return { x: characterPosition.x, z: characterPosition.z }
      })
    }, intervalMs)
    return () => clearInterval(interval)
  }, [enabled])

  return pos
}
