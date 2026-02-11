import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { HALF_GROUND, WALL_THICKNESS } from '../world/constants'

export function CameraController() {
  const { camera } = useThree()
  const isDragging = useRef(false)
  const previousMousePosition = useRef({ x: 0, y: 0 })

  // Configure orthographic camera clipping planes
  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      Object.assign(camera, { near: -1000, far: 1000 })
      camera.updateProjectionMatrix()
    }
  }, [camera])

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true
      previousMousePosition.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return

      const deltaX = e.clientX - previousMousePosition.current.x
      const deltaY = e.clientY - previousMousePosition.current.y

      // Bewegungsrichtungen für isometrische Ansicht
      const moveScaleX = 0.015
      const moveScaleY = 0.03
      
      // In isometrischer Ansicht (45° Winkel):
      // Rechts auf dem Screen = -X, +Z
      // Oben auf dem Screen = -X, -Z
      const rightDir = new THREE.Vector3(-1, 0, 1)
      const upDir = new THREE.Vector3(-1, 0, -1)
      
      const movement = new THREE.Vector3()
        .addScaledVector(rightDir, deltaX * moveScaleX)
        .addScaledVector(upDir, deltaY * moveScaleY)

      camera.position.add(movement)

      previousMousePosition.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
      isDragging.current = false
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [camera])

  // Elastic lerp-back: if the camera's ground-projected center is outside
  // the allowed area, smoothly pull it back inside.
  const CAM_OFFSET = 5
  const CAMERA_BOUND = HALF_GROUND - WALL_THICKNESS / 2
  const RETURN_SPEED = 0.12

  useFrame(() => {
    const targetX =
      THREE.MathUtils.clamp(
        camera.position.x - CAM_OFFSET,
        -CAMERA_BOUND,
        CAMERA_BOUND,
      ) + CAM_OFFSET
    const targetZ =
      THREE.MathUtils.clamp(
        camera.position.z - CAM_OFFSET,
        -CAMERA_BOUND,
        CAMERA_BOUND,
      ) + CAM_OFFSET

    camera.position.x += (targetX - camera.position.x) * RETURN_SPEED // eslint-disable-line react-hooks/immutability
    camera.position.z += (targetZ - camera.position.z) * RETURN_SPEED
  })

  return null
}
