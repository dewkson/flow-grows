import { useMemo } from 'react'
import { useFBX, useTexture } from '@react-three/drei'
import * as THREE from 'three'

function applyTextures(
  object: THREE.Object3D,
  diffuse: THREE.Texture,
  normal?: THREE.Texture,
) {
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      const mat = new THREE.MeshStandardMaterial({
        map: diffuse,
        normalMap: normal,
        side: THREE.DoubleSide,
        transparent: true,
        alphaTest: 0.5,
      })
      mesh.material = mat
      mesh.castShadow = true
      mesh.receiveShadow = true
    }
  })
}

function Grass({ position }: { position: [number, number, number] }) {
  const fbx = useFBX('/models/grass-01.fbx')
  const diffuse = useTexture('/models/textures/pProcessGrass-t_diffuseOriginal.png')
  const normal = useTexture('/models/textures/pProcessGrass-t_normal.png')

  const model = useMemo(() => {
    const clone = fbx.clone()
    // FBX aus 3D-Tools ist oft Y-up mit -90° X-Rotation nötig
    clone.rotation.set(0, 0, 0)
    applyTextures(clone, diffuse, normal)
    return clone
  }, [fbx, diffuse, normal])

  return <primitive object={model} position={position} scale={0.05} />
}

function Bonsai({ position }: { position: [number, number, number] }) {
  const fbx = useFBX('/models/bonsai-01.fbx')
  const leavesTex = useTexture('/models/textures/leave.jpeg')
  const treeTex = useTexture('/models/textures/tree.jpeg')

  const model = useMemo(() => {
    const clone = fbx.clone()
    clone.rotation.set(0, 0, 0)
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const name = mesh.name.toLowerCase()
        // Blätter vs. Stamm anhand des Mesh-Namens zuordnen
        const tex = name.includes('leave') || name.includes('leaf') ? leavesTex : treeTex
        mesh.material = new THREE.MeshStandardMaterial({
          map: tex,
          side: THREE.DoubleSide,
        })
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
    return clone
  }, [fbx, leavesTex, treeTex])

  return <primitive object={model} position={position} scale={0.1} />
}

export function GardenModels() {
  return (
    <>
      {/* Bonsai zentral */}
      {/*<Bonsai position={[0, 0, 0]} /> */}

      {/* Grass zentral + ein Clone versetzt */}
      {/*<Grass position={[2, 0, 1]} /> */}
      {/*<Grass position={[-4, 0, -3]} /> */}
    </>
  )
}

useFBX.preload('/models/grass-01.fbx')
useFBX.preload('/models/bonsai-01.fbx')
useTexture.preload('/models/textures/pProcessGrass-t_diffuseOriginal.png')
useTexture.preload('/models/textures/pProcessGrass-t_normal.png')
useTexture.preload('/models/textures/leave.jpeg')
useTexture.preload('/models/textures/tree.jpeg')
