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
