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

/** Isometric camera tilt (downward angle from horizontal, in degrees) matching the
 * original hardcoded ISO_CAMERA_POSITION of (CAM_OFFSET, CAM_OFFSET/√2, CAM_OFFSET),
 * so the default view is unchanged for existing users. User-adjustable via the
 * editor's camera panel (gardenStore `cameraTiltDeg`), persisted in localStorage.
 * tan(tilt) = y / horizontalRadius = (CAM_OFFSET/√2) / (CAM_OFFSET*√2) = 1/2. */
export const DEFAULT_CAMERA_TILT_DEG = (Math.atan(0.5) * 180) / Math.PI

/** Isometric camera position for a given tilt angle (degrees). The horizontal offset
 * (X/Z = CAM_OFFSET) and yaw (45°) are always fixed – only the height (and therefore the
 * downward look angle) varies, so this never affects the character-follow/bounds math
 * elsewhere, which only relies on the fixed CAM_OFFSET. */
export function getIsoCameraPosition(tiltDeg: number): THREE.Vector3 {
  const tiltRad = (tiltDeg * Math.PI) / 180
  const horizontalRadius = CAM_OFFSET * Math.SQRT2
  return new THREE.Vector3(CAM_OFFSET, horizontalRadius * Math.tan(tiltRad), CAM_OFFSET)
}

/** Camera orientation looking at the world origin from the given position. Dragging the
 * camera only ever translates its position, never its rotation – free-camera mode is the
 * only thing that rotates the camera, and always returns to this exact orientation
 * afterwards, so the isometric tilt stays constant everywhere else. */
export function getIsoCameraQuaternion(position: THREE.Vector3): THREE.Quaternion {
  return new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().lookAt(position, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)),
  )
}

/** Polar angle (tilt from vertical, radians) for a given tilt-from-horizontal (degrees).
 * Free-camera mode locks OrbitControls' min/maxPolarAngle to this so the downward-looking
 * slope always matches the rest of the app exactly, regardless of the orbit target's height. */
export function getIsoPolarAngleRad(tiltDeg: number): number {
  return Math.PI / 2 - (tiltDeg * Math.PI) / 180
}

/** Default-tilt isometric camera position/orientation, for spots that only need the
 * unmodified default (e.g. the initial `camera` prop passed to <Canvas> in App.tsx). */
export const ISO_CAMERA_POSITION = getIsoCameraPosition(DEFAULT_CAMERA_TILT_DEG)
export const ISO_CAMERA_QUATERNION = getIsoCameraQuaternion(ISO_CAMERA_POSITION)
export const ISO_POLAR_ANGLE = getIsoPolarAngleRad(DEFAULT_CAMERA_TILT_DEG)

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
