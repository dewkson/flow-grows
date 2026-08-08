import { OrbitControls } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { characterPosition } from '../character/characterPosition'
import { useGardenStore } from '../store/gardenStore'
import { ISO_POLAR_ANGLE } from '../world/constants'

/** Look-at height above the frozen character, roughly eye level (matches CameraFocus). */
const FOCUS_Y_OFFSET = 3

/**
 * Editor-only "free look" camera: classic OrbitControls (left-drag rotate, right-drag
 * pan, scroll zoom) orbiting the character's frozen position. Only mounted while
 * freeCameraMode is active — see gardenStore + CameraController/CameraFocus, which stand
 * down while this is mounted.
 */
export function FreeCameraController() {
  const { gl } = useThree()
  const cameraLockedRef = useRef(false)

  useEffect(() => {
    return useGardenStore.subscribe((state) => {
      cameraLockedRef.current = state.cameraLocked
    })
  }, [])

  // Fixed for the lifetime of this mount: the character is frozen while free-cam is active
  const target = useMemo(
    () => new THREE.Vector3(characterPosition.x, characterPosition.y + FOCUS_Y_OFFSET, characterPosition.z),
    [],
  )

  // Ctrl+left-drag (or the persistent "Kamera sperren" toggle) should keep the camera
  // fixed instead of orbiting — swallow the pointerdown in the capture phase so
  // OrbitControls' own (bubble-phase) listener on the same element never sees it and
  // never starts a rotate/pan drag (the default three.js behavior would otherwise turn
  // Ctrl+left-drag into a pan, which isn't what we want here).
  useEffect(() => {
    const dom = gl.domElement
    const blockLockedDrag = (e: PointerEvent) => {
      if (e.button === 0 && (e.ctrlKey || cameraLockedRef.current)) {
        e.stopImmediatePropagation()
      }
    }
    dom.addEventListener('pointerdown', blockLockedDrag, { capture: true })
    return () => dom.removeEventListener('pointerdown', blockLockedDrag, { capture: true })
  }, [gl])

  return (
    <OrbitControls
      target={target}
      minPolarAngle={ISO_POLAR_ANGLE}
      maxPolarAngle={ISO_POLAR_ANGLE}
      screenSpacePanning={false}
      enableDamping
      dampingFactor={0.15}
    />
  )
}
