import type { ColliderShape } from './collider'

export type TriggerZone = {
  id: string
  /** Center position on the XZ plane */
  position: [number, number]
  /** Width (X) and depth (Z) – used when shape is 'box' */
  size: [number, number]
  /** Radius – used when shape is 'cylinder' */
  radius: number
  /** Rotation around the vertical (up) axis, in radians – only affects 'box' triggers */
  rotationY: number
  /** Base shape used for the visual + the enter/exit test (same math as Collider, but non-solid) */
  shape: ColliderShape
  /** Id of a registered trigger action (see src/systems/triggerRegistry.ts) fired when the character enters */
  onEnterActionId: string | null
  /** Id of a registered trigger action fired when the character leaves */
  onExitActionId: string | null
  /** Minimum time (seconds) between two firings of the same edge, to debounce jitter right at the boundary */
  cooldownSec: number
  /** If true, this zone fires at most once per session (per edge) */
  once: boolean
}

let nextId = 1

export function createTriggerZone(x: number, z: number, width = 4, depth = 4): TriggerZone {
  return {
    id: `trigger-${Date.now()}-${nextId++}`,
    position: [x, z],
    size: [width, depth],
    radius: width / 2,
    rotationY: 0,
    shape: 'box',
    onEnterActionId: null,
    onExitActionId: null,
    cooldownSec: 0.5,
    once: false,
  }
}
