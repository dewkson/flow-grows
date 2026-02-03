import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function CameraController() {
  const { camera } = useThree()
  const isDragging = useRef(false)
  const previousMousePosition = useRef({ x: 0, y: 0 })

  // Ground plane rotation: [-Math.PI / 3, 0, 0]
  const GROUND_ROTATION_X = -Math.PI / 5
  const CAMERA_DISTANCE = -9
  const CAMERA_HEIGHT = 10

  useEffect(() => {
    // Initiale isometrische Kamera-Position
    camera.position.set(
      0,
      CAMERA_DISTANCE * Math.cos(GROUND_ROTATION_X) + CAMERA_HEIGHT,
      CAMERA_DISTANCE * Math.sin(GROUND_ROTATION_X)
    )

    // Isometrische Rotation (blickt von schräg oben auf die Szene)
    //const euler = new THREE.Euler(-Math.PI / 6, 0, 0, 'YXZ')
    //camera.quaternion.setFromEuler(euler)
  }, [CAMERA_DISTANCE, GROUND_ROTATION_X, camera])

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true
      previousMousePosition.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return

      const deltaX = e.clientX - previousMousePosition.current.x
      const deltaY = e.clientY - previousMousePosition.current.y

      // Bewegungsrichtungen auf der geneigten Ebene
      const xDirection = new THREE.Vector3(1, 0, 0)
      const zDirection = new THREE.Vector3(
        0,
        Math.cos(GROUND_ROTATION_X),
        Math.sin(GROUND_ROTATION_X)
      )

      // Bewegung berechnen
      const moveScale = 0.007
      const movement = new THREE.Vector3()
        .addScaledVector(xDirection, -deltaX * moveScale)
        .addScaledVector(zDirection, deltaY * moveScale)

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
  }, [GROUND_ROTATION_X, camera])

  return null
}
