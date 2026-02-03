export function Character() {
  return (
    <mesh position={[0, 0.5, 0]} castShadow>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial color="#a75824" />
    </mesh>
  )
}
