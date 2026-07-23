import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

const MODEL_PATH = '/models/Blender/Isle Origintree.glb'
const MUSIC_MODEL_PATH = '/models/Blender/Hextile Music.glb'
const MIDI_MODEL_PATH = '/models/download/Midi controller.glb'

/** Rotation shared by all hex tiles so their edges stay aligned when tiled */
const HEXTILE_ROTATION_Y = Math.PI / 4 + Math.PI / 6

/** Extra vertical-axis spin applied only to the origin tile's props (does not affect footprint of neighbors) */
const ORIGIN_TILE_EXTRA_ROTATION_Y = Math.PI / 6

/** Hex tile scale shared by all hex tiles */
const HEXTILE_SCALE = 5

// ─── Components ──────────────────────────────────────────────────────────────

function OrigintreeModel() {
  const { scene } = useGLTF(MODEL_PATH)

  const clone = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return
      const mesh = obj as THREE.Mesh
      mesh.castShadow = true
      mesh.receiveShadow = true
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach((m) => {
        const std = m as THREE.MeshStandardMaterial
        if (std.normalMap) {
          std.normalMap = null
          std.needsUpdate = true
        }
      })
    })
    return c
  }, [scene])

  return (
    <primitive
      object={clone}
      position={[0, 0.1, 0]}
      rotation={[0, HEXTILE_ROTATION_Y - ORIGIN_TILE_EXTRA_ROTATION_Y, 0]}
      scale={HEXTILE_SCALE}
    />
  )
}


// ─── Preload ─────────────────────────────────────────────────────────────────

useGLTF.preload(MODEL_PATH)
useGLTF.preload(MUSIC_MODEL_PATH)
useGLTF.preload(MIDI_MODEL_PATH)

// ─── Export ──────────────────────────────────────────────────────────────────

export function GardenModels() {
  return (
    <>
      <OrigintreeModel />
      {/* <MidiControllerModel /> */}
    </>
  )
}
