import type { Collider } from '../data/collider'
import { CHARACTER_RADIUS } from '../world/constants'

/**
 * Resolve a desired position against all colliders.
 * Uses circle-vs-AABB collision: pushes the character circle out of any
 * overlapping box and returns the corrected position.
 */
export function resolveCollisions(
  x: number,
  z: number,
  colliders: Collider[],
  radius = CHARACTER_RADIUS,
): [number, number] {
  let cx = x
  let cz = z

  for (const col of colliders) {
    const [bx, bz] = col.position
    const [hw, hd] = [col.size[0] / 2, col.size[1] / 2]

    // Closest point on the AABB to the circle center
    const closestX = Math.max(bx - hw, Math.min(cx, bx + hw))
    const closestZ = Math.max(bz - hd, Math.min(cz, bz + hd))

    const dx = cx - closestX
    const dz = cz - closestZ
    const distSq = dx * dx + dz * dz

    if (distSq < radius * radius) {
      const dist = Math.sqrt(distSq)
      if (dist === 0) {
        // Circle center is inside the box – push out on the shortest axis
        const overlapX = hw + radius - Math.abs(cx - bx)
        const overlapZ = hd + radius - Math.abs(cz - bz)
        if (overlapX < overlapZ) {
          cx += cx >= bx ? overlapX : -overlapX
        } else {
          cz += cz >= bz ? overlapZ : -overlapZ
        }
      } else {
        // Push the circle out along the line from closest point to center
        const overlap = radius - dist
        cx += (dx / dist) * overlap
        cz += (dz / dist) * overlap
      }
    }
  }

  return [cx, cz]
}
