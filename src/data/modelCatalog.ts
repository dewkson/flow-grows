/** Catalog of glTF models available for free placement in editor mode (from public/models/Blender). */
export type ModelCatalogEntry = {
  path: string
  label: string
}

export const MODEL_CATALOG: ModelCatalogEntry[] = [
  { path: '/models/Blender/bush.glb', label: 'Busch' },
  { path: '/models/Blender/rock.glb', label: 'Stein' },
  { path: '/models/Blender/tree_conifer.glb', label: 'Nadelbaum' },
  { path: '/models/Blender/tree_deciduous.glb', label: 'Laubbaum' },
  { path: '/models/Blender/Isle Road.glb', label: 'Weg-Insel' },
  { path: '/models/Blender/Isle Origintree.glb', label: 'Origintree-Insel' },
  { path: '/models/Blender/Hextile Origintree.glb', label: 'Hextile Origintree' },
  { path: '/models/Blender/Hextile Music.glb', label: 'Hextile Music' },
]
