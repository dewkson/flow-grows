export function Ground() {
  return (
    <mesh rotation={[-Math.PI / 5, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#205e32" />
    </mesh>
  )
}
