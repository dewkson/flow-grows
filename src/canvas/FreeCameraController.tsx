import { OrbitControls } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { characterPosition } from '../character/characterPosition'
import { useGardenStore } from '../store/gardenStore'
import { getIsoPolarAngleRad } from '../world/constants'

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
  const cameraLocked = useGardenStore((s) => s.cameraLocked)
  const cameraTiltDeg = useGardenStore((s) => s.cameraTiltDeg)
  const polarAngle = useMemo(() => getIsoPolarAngleRad(cameraTiltDeg), [cameraTiltDeg])

  // Fixed for the lifetime of this mount: the character is frozen while free-cam is active
  const target = useMemo(
    () => new THREE.Vector3(characterPosition.x, characterPosition.y + FOCUS_Y_OFFSET, characterPosition.z),
    [],
  )

  // Ctrl+left-drag should keep the camera fixed instead of orbiting — swallow the
  // pointerdown in the capture phase so OrbitControls' own (bubble-phase) listener on
  // the same element never sees it (the default three.js behavior would otherwise turn
  // Ctrl+left-drag into a pan, which isn't what we want here). The persistent "Kamera
  // sperren" toggle is handled separately via enableRotate below, NOT via this DOM block,
  // so it doesn't also swallow clicks meant for collider/model manipulators.
  useEffect(() => {
    const dom = gl.domElement
    const blockCtrlDrag = (e: PointerEvent) => {
      if (e.button === 0 && e.ctrlKey) {
        e.stopImmediatePropagation()
      }
    }
    dom.addEventListener('pointerdown', blockCtrlDrag, { capture: true })
    return () => dom.removeEventListener('pointerdown', blockCtrlDrag, { capture: true })
  }, [gl])

  return (
    <OrbitControls
      target={target}
      minPolarAngle={polarAngle}
      maxPolarAngle={polarAngle}
      screenSpacePanning={false}
      enableRotate={!cameraLocked}
      enableDamping
      dampingFactor={0.15}
    />
  )
}
