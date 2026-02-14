import { GROUND_SIZE } from './constants'

export function Ground() {
  return (
    <mesh position={[0, -0.5, 0]} receiveShadow>
      <boxGeometry args={[GROUND_SIZE, 1, GROUND_SIZE]} />
      <meshStandardMaterial color="#488a5a" />
    </mesh>
  )
}
