import { OrbitControls } from '@react-three/drei'
import { useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { characterPosition } from '../character/characterPosition'

/** Look-at height above the frozen character, roughly eye level (matches CameraFocus). */
const FOCUS_Y_OFFSET = 3

/**
 * Editor-only "free look" camera: classic OrbitControls (left-drag rotate, right-drag
 * pan, scroll zoom) orbiting the character's frozen position. Only mounted while
 * freeCameraMode is active — see gardenStore + CameraController/CameraFocus, which stand
 * down while this is mounted.
 */
export function FreeCameraController() {
  const { camera } = useThree()

  // Fixed for the lifetime of this mount: the character is frozen while free-cam is active
  const target = useMemo(
    () => new THREE.Vector3(characterPosition.x, characterPosition.y + FOCUS_Y_OFFSET, characterPosition.z),
    [],
  )

  // Lock the vertical viewing angle to whatever it was on entry, so dragging can only
  // rotate around the height (Y) axis — the camera never tilts up/down or changes height.
  const polarAngle = useMemo(() => {
    const offset = new THREE.Vector3().subVectors(camera.position, target)
    return new THREE.Spherical().setFromVector3(offset).phi
  }, [camera, target])

  return (
    <OrbitControls
      target={target}
      minPolarAngle={polarAngle}
      maxPolarAngle={polarAngle}
      screenSpacePanning={false}
      enableDamping
      dampingFactor={0.15}
    />
  )
}
