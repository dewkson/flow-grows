export type ColliderShape = 'box' | 'cylinder'

export type Collider = {
  id: string
  /** Center position on the XZ plane */
  position: [number, number]
  /** Width (X) and depth (Z) – used when shape is 'box' */
  size: [number, number]
  /** Radius – used when shape is 'cylinder' */
  radius: number
  /** Rotation around the vertical (up) axis, in radians – only affects 'box' colliders */
  rotationY: number
  /** Base shape used for both the visual and the collision test */
  shape: ColliderShape
}

let nextId = 1

export function createCollider(
  x: number,
  z: number,
  width = 4,
  depth = 4,
): Collider {
  return {
    id: `collider-${Date.now()}-${nextId++}`,
    position: [x, z],
    size: [width, depth],
    radius: width / 2,
    rotationY: 0,
    shape: 'box',
  }
}
