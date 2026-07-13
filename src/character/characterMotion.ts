/**
 * Shared mutable object updated by Character every frame, exposing the
 * smoothed movement speed and current animation state for other systems
 * (e.g. the editor's motion-tuning panel) without causing re-renders.
 */
export const characterMotion = {
  speed: 0,
  state: 'idle' as 'idle' | 'walk' | 'run',
}
