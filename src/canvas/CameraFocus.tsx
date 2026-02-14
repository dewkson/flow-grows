import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGardenStore } from '../store/gardenStore'

const FOCUS_LERP_SPEED = 0.04
const FOCUS_Y_OFFSET = 3
const CAM_OFFSET = 5

export function CameraFocus() {
  const { camera } = useThree()
  const savedPosition = useRef<THREE.Vector3 | null>(null)
  const wasActive = useRef(false)

  const activeContentId = useGardenStore((s) => s.activeContentId)
  const contentAreas = useGardenStore((s) => s.contentAreas)

  useFrame(() => {
    const isActive = activeContentId !== null

    // Just became active — save camera position
    if (isActive && !wasActive.current) {
      savedPosition.current = camera.position.clone()
    }

    // Just became inactive — begin return
    if (!isActive && wasActive.current) {
      // savedPosition stays set; we'll lerp back to it
    }

    wasActive.current = isActive

    if (isActive) {
      const content = contentAreas.find((c) => c.id === activeContentId)
      if (!content) return

      // Target: isometric camera position centered on content
      const targetX = content.worldPosition[0] + CAM_OFFSET
      const targetY = content.worldPosition[1] + FOCUS_Y_OFFSET
      const targetZ = content.worldPosition[2] + CAM_OFFSET

      camera.position.x += (targetX - camera.position.x) * FOCUS_LERP_SPEED // eslint-disable-line react-hooks/immutability
      camera.position.y += (targetY - camera.position.y) * FOCUS_LERP_SPEED
      camera.position.z += (targetZ - camera.position.z) * FOCUS_LERP_SPEED
    } else if (savedPosition.current) {
      // Returning to saved position
      camera.position.x +=
        (savedPosition.current.x - camera.position.x) * FOCUS_LERP_SPEED
      camera.position.y +=
        (savedPosition.current.y - camera.position.y) * FOCUS_LERP_SPEED
      camera.position.z +=
        (savedPosition.current.z - camera.position.z) * FOCUS_LERP_SPEED

      // Close enough — stop lerping
      const dist = camera.position.distanceTo(savedPosition.current)
      if (dist < 0.01) {
        camera.position.copy(savedPosition.current)
        savedPosition.current = null
      }
    }
  })

  return null
}
