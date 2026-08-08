import * as THREE from 'three'

/** Size of the ground plane (square) */
export const GROUND_SIZE = 200

/** Half the ground size – used for boundary clamping */
export const HALF_GROUND = GROUND_SIZE / 2
/** Height of the boundary walls */
export const WALL_HEIGHT = 2

/** Thickness of the boundary walls */
export const WALL_THICKNESS = 0.3

/** Radius of the player character sphere */
export const CHARACTER_RADIUS = 1

/** Max distance the character center can be from origin */
export const CHARACTER_BOUND = HALF_GROUND - CHARACTER_RADIUS

/** Isometric camera offset from world-center to camera position */
export const CAM_OFFSET = 5

/** Editor panels (Collider/Hotspot/Hint/Modell-Listen) show only items within this
 * XZ distance from the character by default, to keep large gardens overseeable. */
export const EDITOR_LIST_RADIUS = 20

/** Extra distance (beyond the character's + collider's combined solid radius) at which
 * obstacle-avoidance steering starts nudging the character sideways around a collider
 * it is heading straight into, so it can curve around obstacles instead of getting
 * stuck pressing against them when the follow target lies behind one. */
export const OBSTACLE_AVOIDANCE_MARGIN = 3

/** How strongly the avoidance nudge deflects movement, as a multiple of the character's
 * per-frame max-speed step. */
export const OBSTACLE_AVOIDANCE_STRENGTH = 1.4

/** Initial isometric camera position (must match the `camera` prop passed to <Canvas> in App.tsx). */
export const ISO_CAMERA_POSITION = new THREE.Vector3(5, 5 / Math.sqrt(2), 5)

/** Fixed camera orientation for the isometric view (Play mode and normal Editor mode):
 * looking at the world origin from ISO_CAMERA_POSITION. Dragging the camera only ever
 * translates its position, never its rotation – free-camera mode is the only thing that
 * rotates the camera, and always returns to this exact orientation afterwards, so the
 * isometric tilt stays constant everywhere else. */
export const ISO_CAMERA_QUATERNION = new THREE.Quaternion().setFromRotationMatrix(
  new THREE.Matrix4().lookAt(ISO_CAMERA_POSITION, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)),
)

/** Seconds of near-zero progress toward the follow target before the character freezes
 * in place instead of endlessly pressing/sliding against whatever is blocking it. */
export const STUCK_DEBOUNCE_TIME = 0.12

/** Progress rate (world units/sec of closing distance to the target) below which
 * movement counts as "stalled" for stuck detection – catches both a hard wall press
 * and sliding along a collider that never actually closes the distance to the target. */
export const STUCK_PROGRESS_RATE_THRESHOLD = 0.4

/** Angle (radians) the desired travel direction must change by, compared to the
 * direction recorded when the character froze, before it resumes trying to move. */
export const STUCK_DIRECTION_CHANGE_ANGLE = (25 * Math.PI) / 180
