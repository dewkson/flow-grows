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
