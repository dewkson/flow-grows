import { GROUND_SIZE } from './constants'

export function Ground() {
  return (
    <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
      <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
      <meshStandardMaterial color="#488a5a" />
    </mesh>
  )
}
