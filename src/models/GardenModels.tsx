import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

const MODEL_PATH = '/models/Blender/Hextile Origintree.glb'
const MIDI_MODEL_PATH = '/models/download/Midi controller.glb'

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

  return <primitive object={clone} position={[0, 0.1, 0]} rotation={[0, Math.PI / 4 + Math.PI / 6, 0]} scale={5} />
}

function MidiControllerModel() {
  const { scene } = useGLTF(MIDI_MODEL_PATH)

  const clone = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return
      const mesh = obj as THREE.Mesh
      mesh.castShadow = true
      mesh.receiveShadow = true
    })
    return c
  }, [scene])

  // Native units appear to be cm (~57 cm half-width) → scale to ~0.12 for world units
  return <primitive object={clone} position={[3, 0, 2]} rotation={[0, Math.PI / 4, 0]} scale={0.12} />
}

// ─── Preload ─────────────────────────────────────────────────────────────────

useGLTF.preload(MODEL_PATH)
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
