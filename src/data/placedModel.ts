/** A single glTF model instance placed freely on the ground plane by an editor. */
export type PlacedModel = {
  id: string
  /** Path into the model catalog (public/models/...) */
  modelPath: string
  /** Center position on the XZ plane */
  position: [number, number]
  /** Height above the ground plane */
  positionY: number
  /** Rotation around the vertical (up) axis, in radians */
  rotationY: number
  /** Uniform scale factor applied to the model */
  scale: number
}

let nextId = 1

export function createPlacedModel(
  modelPath: string,
  x: number,
  z: number,
  rotationY = 0,
  scale = 1,
  positionY = 0,
): PlacedModel {
  return {
    id: `placed-model-${Date.now()}-${nextId++}`,
    modelPath,
    position: [x, z],
    positionY,
    rotationY,
    scale,
  }
}
