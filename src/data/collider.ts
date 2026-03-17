export type Collider = {
  id: string
  /** Center position on the XZ plane */
  position: [number, number]
  /** Width (X) and depth (Z) */
  size: [number, number]
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
  }
}
