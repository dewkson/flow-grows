import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CAM_OFFSET, HALF_GROUND, ISO_CAMERA_QUATERNION, WALL_THICKNESS } from '../world/constants'
import { useGardenStore } from '../store/gardenStore'

export function CameraController() {
  const { camera } = useThree()
  const isDragging = useRef(false)
  const previousMousePosition = useRef({ x: 0, y: 0 })
  const isEditingTextRef = useRef(false)
  const cameraDragLockedRef = useRef(false)

  const isEmbedOpenRef = useRef(false)
  const freeCameraModeRef = useRef(false)
  const wasFreeCameraRef = useRef(false)
  const returningRef = useRef(false)
  const savedPoseRef = useRef<{ position: THREE.Vector3; zoom: number } | null>(null)

  // Keep refs in sync with the store so event handlers see the latest value
  useEffect(() => {
    return useGardenStore.subscribe(
      (state) => {
        isEditingTextRef.current = state.isEditingText
        isEmbedOpenRef.current = state.isEmbedOpen
        cameraDragLockedRef.current = state.cameraDragLocked
        freeCameraModeRef.current = state.freeCameraMode
      },
    )
  }, [])

  // Configure orthographic camera clipping planes
  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      Object.assign(camera, { near: -1000, far: 1000 })
      camera.updateProjectionMatrix()
    }
  }, [camera])

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest('[data-no-camera-drag="true"]')) return
      if (cameraDragLockedRef.current || isEditingTextRef.current || isEmbedOpenRef.current || freeCameraModeRef.current) return
      isDragging.current = true
      previousMousePosition.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (cameraDragLockedRef.current || freeCameraModeRef.current) {
        isDragging.current = false
        return
      }
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
  const CAMERA_BOUND = HALF_GROUND - WALL_THICKNESS / 2
  const RETURN_SPEED = 0.12

  useFrame(() => {
    // While free-camera mode (OrbitControls) is active, it owns the camera exclusively —
    // just remember the pose we had right before entering, to lerp back to on exit.
    if (freeCameraModeRef.current) {
      if (!wasFreeCameraRef.current) {
        savedPoseRef.current = {
          position: camera.position.clone(),
          zoom: (camera as THREE.OrthographicCamera).zoom,
        }
      }
      wasFreeCameraRef.current = true
      return
    }

    if (wasFreeCameraRef.current) {
      wasFreeCameraRef.current = false
      returningRef.current = true
    }

    if (returningRef.current && savedPoseRef.current) {
      const saved = savedPoseRef.current
      const orthoCam = camera as THREE.OrthographicCamera
      camera.position.lerp(saved.position, RETURN_SPEED)
      camera.quaternion.slerp(ISO_CAMERA_QUATERNION, RETURN_SPEED)
      orthoCam.zoom += (saved.zoom - orthoCam.zoom) * RETURN_SPEED // eslint-disable-line react-hooks/immutability
      orthoCam.updateProjectionMatrix()

      const doneRotating = camera.quaternion.angleTo(ISO_CAMERA_QUATERNION) < 0.001
      if (camera.position.distanceTo(saved.position) < 0.01 && Math.abs(orthoCam.zoom - saved.zoom) < 0.01 && doneRotating) {
        camera.position.copy(saved.position)
        camera.quaternion.copy(ISO_CAMERA_QUATERNION)
        orthoCam.zoom = saved.zoom
        orthoCam.updateProjectionMatrix()
        returningRef.current = false
        savedPoseRef.current = null
      }
      return
    }

    // Guard against any drift: outside of free-camera mode, the isometric tilt is fixed.
    camera.quaternion.copy(ISO_CAMERA_QUATERNION)

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
