/** Size of the ground plane (square) */
export const GROUND_SIZE = 50

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
