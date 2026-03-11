import { create } from 'zustand'
import { contentAreas, type ContentArea } from '../data/contentArea'

const STORAGE_KEY = 'flow-grows-content'

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

type GardenStoreState = {
  contentAreas: ContentArea[]
  activeContentId: string | null
  debugZones: boolean
  editorMode: boolean
  isEditingText: boolean
  unlockArea: (id: string) => void
  setActiveContent: (id: string | null) => void
  toggleDebugZones: () => void
  toggleEditorMode: () => void
  setIsEditingText: (editing: boolean) => void
  updateContentText: (id: string, description: string) => void
}

export const useGardenStore = create<GardenStoreState>((set) => ({
  contentAreas: loadContentAreas(),
  activeContentId: null,
  debugZones: true,
  editorMode: false,
  isEditingText: false,
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
}))
