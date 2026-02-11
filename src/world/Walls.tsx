import { GROUND_SIZE, HALF_GROUND, WALL_HEIGHT, WALL_THICKNESS } from './constants'

const WALL_COLOR = '#6b4c3b'
const WALL_Y = WALL_HEIGHT / 2

export function Walls() {
  return (
    <group>
      {/* North wall (positive Z edge) */}
      <mesh position={[0, WALL_Y, HALF_GROUND]} castShadow receiveShadow>
        <boxGeometry args={[GROUND_SIZE, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>

      {/* South wall (negative Z edge) */}
      <mesh position={[0, WALL_Y, -HALF_GROUND]} castShadow receiveShadow>
        <boxGeometry args={[GROUND_SIZE, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>

      {/* East wall (positive X edge) */}
      <mesh position={[HALF_GROUND, WALL_Y, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, GROUND_SIZE]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>

      {/* West wall (negative X edge) */}
      <mesh position={[-HALF_GROUND, WALL_Y, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, GROUND_SIZE]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
    </group>
  )
}
