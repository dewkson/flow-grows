import type { Collider } from '../data/collider'
import { CHARACTER_RADIUS } from '../world/constants'

/**
 * Resolve a desired position against all colliders.
 * Box colliders use circle-vs-OBB collision (the box may be rotated around the
 * vertical axis): the circle center is transformed into the box's local space,
 * resolved there like a regular circle-vs-AABB test, then transformed back.
 * Cylinder colliders use simple circle-vs-circle collision (rotation-invariant).
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

    if (col.shape === 'cylinder') {
      const dx = cx - bx
      const dz = cz - bz
      const distSq = dx * dx + dz * dz
      const minDist = col.radius + radius

      if (distSq < minDist * minDist) {
        const dist = Math.sqrt(distSq)
        if (dist === 0) {
          cx += minDist
        } else {
          const overlap = minDist - dist
          cx += (dx / dist) * overlap
          cz += (dz / dist) * overlap
        }
      }
      continue
    }

    const [hw, hd] = [col.size[0] / 2, col.size[1] / 2]
    const rot = col.rotationY ?? 0
    const cos = Math.cos(rot)
    const sin = Math.sin(rot)

    // World -> local: undo the box's rotation around its own center
    const relX = cx - bx
    const relZ = cz - bz
    const lx = relX * cos - relZ * sin
    const lz = relX * sin + relZ * cos

    // Closest point on the AABB (in local space) to the circle center
    const closestX = Math.max(-hw, Math.min(lx, hw))
    const closestZ = Math.max(-hd, Math.min(lz, hd))

    const dx = lx - closestX
    const dz = lz - closestZ
    const distSq = dx * dx + dz * dz

    if (distSq < radius * radius) {
      let correctedLx = lx
      let correctedLz = lz
      const dist = Math.sqrt(distSq)
      if (dist === 0) {
        // Circle center is inside the box – push out on the shortest axis
        const overlapX = hw + radius - Math.abs(lx)
        const overlapZ = hd + radius - Math.abs(lz)
        if (overlapX < overlapZ) {
          correctedLx = lx >= 0 ? lx + overlapX : lx - overlapX
        } else {
          correctedLz = lz >= 0 ? lz + overlapZ : lz - overlapZ
        }
      } else {
        // Push the circle out along the line from closest point to center
        const overlap = radius - dist
        correctedLx = lx + (dx / dist) * overlap
        correctedLz = lz + (dz / dist) * overlap
      }

      // Local -> world: reapply the box's rotation
      cx = bx + (correctedLx * cos + correctedLz * sin)
      cz = bz + (-correctedLx * sin + correctedLz * cos)
    }
  }

  return [cx, cz]
}
