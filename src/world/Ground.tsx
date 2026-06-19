import { GROUND_SIZE } from './constants'

export function Ground() {
  return (
    <>
      {/* Outer dark soil plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial color="#2b3a1c" />
      </mesh>
      {/* Oval grass island – matches the oval shape from whole.png */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[36, 64]} />
        <meshStandardMaterial color="#4a7a35" />
      </mesh>
    </>
  )
}
