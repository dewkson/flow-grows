import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

const MODEL_PATH = '/models/Blender/Hextile Origintree.glb'

// ─── Component ───────────────────────────────────────────────────────────────

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

// ─── Preload ─────────────────────────────────────────────────────────────────

useGLTF.preload(MODEL_PATH)

// ─── Export ──────────────────────────────────────────────────────────────────

export function GardenModels() {
  return <OrigintreeModel />
}
