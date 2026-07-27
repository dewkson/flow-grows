import type { Collider } from '../data/collider'
import { CHARACTER_RADIUS, OBSTACLE_AVOIDANCE_MARGIN, OBSTACLE_AVOIDANCE_STRENGTH } from '../world/constants'

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

/**
 * Steering nudge that lets the character curve around colliders instead of getting
 * stuck pressing straight into them (which can happen with pure push-out collision
 * when the follow target lies directly behind an obstacle, since sliding along a
 * flat wall approached head-on has ~zero tangential component).
 *
 * For every collider roughly ahead of the desired movement direction and within its
 * avoidance radius, this adds a sideways (tangential) push away from the collider's
 * center, scaled by how close/head-on the approach is. Box colliders are treated as
 * their circumscribed circle (rotation-invariant, always fully contains the box) –
 * an approximation that's fine for steering since resolveCollisions() still handles
 * exact, hard collision afterwards.
 *
 * Returns an offset to add to the desired [stepX, stepZ] for this frame (not a unit
 * vector – magnitude already reflects steering strength, callers should scale by a
 * speed-related factor and let the usual max-speed clamp cap the result).
 */
export function computeAvoidanceSteer(
  x: number,
  z: number,
  desiredStepX: number,
  desiredStepZ: number,
  colliders: Collider[],
  radius = CHARACTER_RADIUS,
): [number, number] {
  const desiredLen = Math.hypot(desiredStepX, desiredStepZ)
  if (desiredLen < 1e-6) return [0, 0]

  const dirX = desiredStepX / desiredLen
  const dirZ = desiredStepZ / desiredLen

  let avoidX = 0
  let avoidZ = 0

  for (const col of colliders) {
    const [bx, bz] = col.position
    const boundingRadius =
      col.shape === 'cylinder' ? col.radius : Math.hypot(col.size[0] / 2, col.size[1] / 2)
    const safeRadius = boundingRadius + radius
    const avoidRadius = safeRadius + OBSTACLE_AVOIDANCE_MARGIN

    const towardObstacleX = bx - x
    const towardObstacleZ = bz - z
    const dist = Math.hypot(towardObstacleX, towardObstacleZ)
    if (dist >= avoidRadius || dist < 1e-6) continue

    const towardX = towardObstacleX / dist
    const towardZ = towardObstacleZ / dist

    // Only react to obstacles roughly ahead of the desired travel direction
    const forwardAlignment = dirX * towardX + dirZ * towardZ
    if (forwardAlignment <= 0) continue

    // Two perpendicular candidates – steer to whichever keeps closer to the original heading
    const tangentAX = -towardZ
    const tangentAZ = towardX
    const tangentBX = towardZ
    const tangentBZ = -towardX
    const alignA = dirX * tangentAX + dirZ * tangentAZ
    const alignB = dirX * tangentBX + dirZ * tangentBZ
    const [tangentX, tangentZ] = alignA >= alignB ? [tangentAX, tangentAZ] : [tangentBX, tangentBZ]

    // 0 at the edge of the avoidance radius, ramping up to 1 at the solid radius
    const proximity = Math.max(0, Math.min(1, (avoidRadius - dist) / (avoidRadius - safeRadius || 1)))
    const strength = proximity * forwardAlignment

    avoidX += tangentX * strength
    avoidZ += tangentZ * strength
  }

  return [avoidX * desiredLen * OBSTACLE_AVOIDANCE_STRENGTH, avoidZ * desiredLen * OBSTACLE_AVOIDANCE_STRENGTH]
}

