import { create } from 'zustand'
import { contentAreas, type ContentArea } from '../data/contentArea'
import type { Collider } from '../data/collider'

const STORAGE_KEY = 'flow-grows-content'
const COLLIDER_STORAGE_KEY = 'flow-grows-colliders'

/** Merge saved text overrides into the default content areas */
function loadContentAreas(): ContentArea[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return contentAreas
    const saved = JSON.parse(raw) as Record<string, string>
    return contentAreas.map((area) =>
      saved[area.id] !== undefined ? { ...area, description: saved[area.id] } : area,
    )
  } catch {
    return contentAreas
  }
}

/** Persist only the id→description map (lightweight) */
function saveContentTexts(areas: ContentArea[]) {
  const map: Record<string, string> = {}
  for (const area of areas) {
    map[area.id] = area.description
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

function loadColliders(): Collider[] {
  try {
    const raw = localStorage.getItem(COLLIDER_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Collider[]
  } catch {
    return []
  }
}

function saveColliders(colliders: Collider[]) {
  localStorage.setItem(COLLIDER_STORAGE_KEY, JSON.stringify(colliders))
}

type GardenStoreState = {
  contentAreas: ContentArea[]
  activeContentId: string | null
  debugZones: boolean
  editorMode: boolean
  isEditingText: boolean
  colliders: Collider[]
  selectedColliderId: string | null
  unlockArea: (id: string) => void
  setActiveContent: (id: string | null) => void
  toggleDebugZones: () => void
  toggleEditorMode: () => void
  setIsEditingText: (editing: boolean) => void
  updateContentText: (id: string, description: string) => void
  addCollider: (collider: Collider) => void
  removeCollider: (id: string) => void
  updateCollider: (id: string, patch: Partial<Pick<Collider, 'position' | 'size'>>) => void
  selectCollider: (id: string | null) => void
}

export const useGardenStore = create<GardenStoreState>((set) => ({
  contentAreas: loadContentAreas(),
  activeContentId: null,
  debugZones: true,
  editorMode: false,
  isEditingText: false,
  colliders: loadColliders(),
  selectedColliderId: null,
  unlockArea: (id) =>
    set((state) => ({
      contentAreas: state.contentAreas.map((area) =>
        area.id === id ? { ...area, unlocked: true } : area
      ),
    })),
  setActiveContent: (id) => set({ activeContentId: id }),
  toggleDebugZones: () => set((state) => ({ debugZones: !state.debugZones })),
  toggleEditorMode: () => set((state) => ({ editorMode: !state.editorMode })),
  setIsEditingText: (editing) => set({ isEditingText: editing }),
  updateContentText: (id, description) =>
    set((state) => {
      const updated = state.contentAreas.map((area) =>
        area.id === id ? { ...area, description } : area
      )
      saveContentTexts(updated)
      return { contentAreas: updated }
    }),
  addCollider: (collider) =>
    set((state) => {
      const updated = [...state.colliders, collider]
      saveColliders(updated)
      return { colliders: updated }
    }),
  removeCollider: (id) =>
    set((state) => {
      const updated = state.colliders.filter((c) => c.id !== id)
      saveColliders(updated)
      return {
        colliders: updated,
        selectedColliderId: state.selectedColliderId === id ? null : state.selectedColliderId,
      }
    }),
  updateCollider: (id, patch) =>
    set((state) => {
      const updated = state.colliders.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      )
      saveColliders(updated)
      return { colliders: updated }
    }),
  selectCollider: (id) => set({ selectedColliderId: id }),
}))
