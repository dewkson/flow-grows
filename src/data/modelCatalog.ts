/** Catalog of glTF models available for free placement in editor mode (from public/models/Blender). */
export type ModelCatalogEntry = {
  path: string
  label: string
}

export const MODEL_CATALOG: ModelCatalogEntry[] = [
  { path: '/models/Blender/Isle Road.glb', label: 'Weg-Insel' },
  { path: '/models/Blender/Isle Origintree.glb', label: 'Origintree-Insel' },
  { path: '/models/Blender/Isle Music.glb', label: 'Music-Insel' },
]
