import { useMemo } from 'react'
import * as THREE from 'three'

type RoundedPanelProps = {
  width: number
  height: number
  radius?: number
  color?: string
  opacity?: number
  position?: [number, number, number]
}

/**
 * A rounded-rectangle panel in the XY plane (camera-facing when used inside a Billboard).
 * Built from a THREE.Shape → ShapeGeometry for crisp edges.
 */
export function RoundedPanel({
  width,
  height,
  radius = 0.5,
  color = '#1e293b',
  opacity = 0.88,
  position = [0, 0, 0],
}: RoundedPanelProps) {
  const geometry = useMemo(() => {
    const r = Math.min(radius, width / 2, height / 2)
    const hw = width / 2
    const hh = height / 2

    const shape = new THREE.Shape()

    // Start bottom-left, just after the corner radius
    shape.moveTo(-hw + r, -hh)
    // Bottom edge → bottom-right corner
    shape.lineTo(hw - r, -hh)
    shape.quadraticCurveTo(hw, -hh, hw, -hh + r)
    // Right edge → top-right corner
    shape.lineTo(hw, hh - r)
    shape.quadraticCurveTo(hw, hh, hw - r, hh)
    // Top edge → top-left corner
    shape.lineTo(-hw + r, hh)
    shape.quadraticCurveTo(-hw, hh, -hw, hh - r)
    // Left edge → bottom-left corner
    shape.lineTo(-hw, -hh + r)
    shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh)

    return new THREE.ShapeGeometry(shape, 8)
  }, [width, height, radius])

  return (
    <mesh
      geometry={geometry}
      position={position}
      receiveShadow
      renderOrder={10}
    >
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
        roughness={0.9}
        metalness={0.05}
      />
    </mesh>
  )
}
