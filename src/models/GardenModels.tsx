import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

// ─── Types ───────────────────────────────────────────────────────────────────

type ModelInstance = {
  position: [number, number, number]
  rotationY: number
  scale: number
}

type DeciduousInstance = ModelInstance & {
  /** Optional hex color tint multiplied onto the leaf material (e.g. cherry blossom) */
  color?: string
}

// ─── Rocks ───────────────────────────────────────────────────────────────────
// Perimeter ring matching the oval boundary in whole.png

const ROCK_INSTANCES: ModelInstance[] = [
  // Top arc
  { position: [-5, 0, -33], rotationY: 0.3, scale: 1.2 },
  { position: [9, 0, -31], rotationY: 1.8, scale: 0.9 },
  { position: [-19, 0, -27], rotationY: 0.7, scale: 1.4 },
  { position: [21, 0, -26], rotationY: 2.5, scale: 1.0 },
  // Right arc
  { position: [32, 0, -13], rotationY: 1.1, scale: 1.3 },
  { position: [35, 0, 1], rotationY: 0.5, scale: 0.8 },
  { position: [31, 0, 15], rotationY: 2.1, scale: 1.1 },
  // Bottom-right
  { position: [25, 0, 25], rotationY: 3.0, scale: 1.2 },
  { position: [13, 0, 32], rotationY: 0.2, scale: 0.9 },
  // Bottom arc
  { position: [2, 0, 34], rotationY: 1.6, scale: 1.0 },
  { position: [-11, 0, 31], rotationY: 2.8, scale: 1.3 },
  // Bottom-left / pond area
  { position: [-23, 0, 25], rotationY: 0.9, scale: 1.5 },
  { position: [-31, 0, 16], rotationY: 1.4, scale: 0.8 },
  // Left arc
  { position: [-35, 0, 3], rotationY: 2.2, scale: 1.1 },
  { position: [-33, 0, -11], rotationY: 0.6, scale: 1.0 },
  // Top-left
  { position: [-26, 0, -22], rotationY: 1.9, scale: 1.3 },
  { position: [-15, 0, -29], rotationY: 3.1, scale: 0.8 },
  // Smaller inner rocks near path intersections
  { position: [6, 0, -9], rotationY: 0.4, scale: 0.5 },
  { position: [-7, 0, 10], rotationY: 2.4, scale: 0.45 },
]

// ─── Conifer trees ───────────────────────────────────────────────────────────
// North perimeter arc, flanks of music/game-dev rooms, sparse south boundary

const CONIFER_INSTANCES: ModelInstance[] = [
  // North perimeter arc (top of oval in whole.png)
  { position: [-24, 0, -27], rotationY: 0.4, scale: 3.8 },
  { position: [-14, 0, -31], rotationY: 1.5, scale: 4.2 },
  { position: [-4,  0, -34], rotationY: 0.1, scale: 4.0 },
  { position: [7,   0, -33], rotationY: 2.2, scale: 3.9 },
  { position: [17,  0, -30], rotationY: 0.9, scale: 3.7 },
  { position: [25,  0, -25], rotationY: 1.7, scale: 3.5 },
  // Top-right arc (backing game-dev room)
  { position: [30,  0, -19], rotationY: 0.6, scale: 3.3 },
  { position: [33,  0, -10], rotationY: 2.0, scale: 3.1 },
  // Left perimeter mid
  { position: [-34, 0, -18], rotationY: 1.3, scale: 3.4 },
  { position: [-35, 0, -5],  rotationY: 0.7, scale: 3.2 },
  // South boundary (sparser)
  { position: [-18, 0, 30],  rotationY: 2.5, scale: 3.0 },
  { position: [-5,  0, 34],  rotationY: 1.1, scale: 3.2 },
  { position: [8,   0, 33],  rotationY: 0.3, scale: 3.0 },
]

// ─── Deciduous trees ─────────────────────────────────────────────────────────
// Central hero oak + cherry blossom in bottom-right (spiral/well area)

const DECIDUOUS_INSTANCES: DeciduousInstance[] = [
  { position: [0,  0, -1], rotationY: 0.5, scale: 5.5 },              // Central oak
  { position: [22, 0, 20], rotationY: 1.2, scale: 2.8, color: '#e8a0b8' }, // Cherry blossom
]

// ─── Bushes ──────────────────────────────────────────────────────────────────
// Scattered along stone paths, around content-zone entrances, near pond

const BUSH_INSTANCES: ModelInstance[] = [
  // Path to music room (top-left)
  { position: [-10, 0, -16], rotationY: 0.8, scale: 1.6 },
  { position: [-15, 0, -12], rotationY: 2.1, scale: 1.4 },
  // Near music room entrance
  { position: [-22, 0, -18], rotationY: 1.0, scale: 1.8 },
  { position: [-26, 0, -14], rotationY: 0.3, scale: 1.5 },
  // Path to game-dev room (top-right)
  { position: [11,  0, -16], rotationY: 1.7, scale: 1.5 },
  { position: [17,  0, -12], rotationY: 2.8, scale: 1.7 },
  { position: [22,  0, -18], rotationY: 0.4, scale: 1.6 },
  // Around central tree ring
  { position: [-5,  0, 7],   rotationY: 1.2, scale: 1.4 },
  { position: [5,   0, 7],   rotationY: 2.4, scale: 1.3 },
  { position: [-8,  0, -7],  rotationY: 0.6, scale: 1.5 },
  { position: [8,   0, -7],  rotationY: 1.9, scale: 1.4 },
  // Path to kitchen (bottom-left)
  { position: [-10, 0, 12],  rotationY: 0.9, scale: 1.6 },
  { position: [-16, 0, 17],  rotationY: 2.2, scale: 1.5 },
  { position: [-22, 0, 14],  rotationY: 1.4, scale: 1.7 },
  // Near pond
  { position: [-26, 0, 22],  rotationY: 0.2, scale: 1.3 },
  { position: [-20, 0, 27],  rotationY: 1.8, scale: 1.2 },
  // Path to spiral/fountain (bottom-right)
  { position: [12,  0, 10],  rotationY: 2.6, scale: 1.5 },
  { position: [17,  0, 16],  rotationY: 0.7, scale: 1.4 },
  { position: [23,  0, 16],  rotationY: 1.5, scale: 1.6 },
  { position: [27,  0, 22],  rotationY: 2.9, scale: 1.4 },
  { position: [18,  0, 24],  rotationY: 0.5, scale: 1.3 },
  // Left mid (between left-arc rocks and garden interior)
  { position: [-29, 0, 8],   rotationY: 1.6, scale: 1.4 },
  { position: [-27, 0, -3],  rotationY: 0.3, scale: 1.5 },
]

// ─── Module-level Three.js objects ───────────────────────────────────────────

const CHERRY_TINT = new THREE.Color('#e8a0b8')

// ─── Components ──────────────────────────────────────────────────────────────

function Rock({ position, rotationY, scale }: ModelInstance) {
  const { scene } = useGLTF('/models/Blender/rock.glb')

  const clone = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return
      const mesh = obj as THREE.Mesh
      mesh.castShadow = true
      mesh.receiveShadow = true
      // Strip normal map baked from Blender procedural textures – causes grid artefacts
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
    <primitive object={clone} position={position} rotation={[0, rotationY, 0]} scale={scale} />
  )
}

function ConiferTree({ position, rotationY, scale }: ModelInstance) {
  const { scene } = useGLTF('/models/Blender/tree_conifer.glb')

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

  return (
    <primitive object={clone} position={position} rotation={[0, rotationY, 0]} scale={scale} />
  )
}

function DeciduousTree({ position, rotationY, scale, color }: DeciduousInstance) {
  const { scene } = useGLTF('/models/Blender/tree_deciduous.glb')

  const clone = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return
      const mesh = obj as THREE.Mesh
      mesh.castShadow = true
      mesh.receiveShadow = true
      if (color) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        mats.forEach((m) => {
          const tinted = (m as THREE.MeshStandardMaterial).clone()
          tinted.color.multiply(CHERRY_TINT)
          tinted.needsUpdate = true
          mesh.material = tinted
        })
      }
    })
    return c
  }, [scene, color])

  return (
    <primitive object={clone} position={position} rotation={[0, rotationY, 0]} scale={scale} />
  )
}

function Bush({ position, rotationY, scale }: ModelInstance) {
  const { scene } = useGLTF('/models/Blender/bush.glb')

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

  return (
    <primitive object={clone} position={position} rotation={[0, rotationY, 0]} scale={scale} />
  )
}

// ─── Preload ─────────────────────────────────────────────────────────────────

useGLTF.preload('/models/Blender/rock.glb')
useGLTF.preload('/models/Blender/tree_conifer.glb')
useGLTF.preload('/models/Blender/tree_deciduous.glb')
useGLTF.preload('/models/Blender/bush.glb')

// ─── Export ──────────────────────────────────────────────────────────────────

export function GardenModels() {
  return (
    <>
      {ROCK_INSTANCES.map((rock, i) => (
        <Rock key={i} {...rock} />
      ))}
      {CONIFER_INSTANCES.map((tree, i) => (
        <ConiferTree key={i} {...tree} />
      ))}
      {DECIDUOUS_INSTANCES.map((tree, i) => (
        <DeciduousTree key={i} {...tree} />
      ))}
      {BUSH_INSTANCES.map((bush, i) => (
        <Bush key={i} {...bush} />
      ))}
    </>
  )
}
