import { create } from 'zustand'
import { contentAreas, type ContentArea } from '../data/contentArea'

type GardenStoreState = {
  contentAreas: ContentArea[]
  activeContentId: string | null
  debugZones: boolean
  unlockArea: (id: string) => void
  setActiveContent: (id: string | null) => void
  toggleDebugZones: () => void
}

export const useGardenStore = create<GardenStoreState>((set) => ({
  contentAreas: contentAreas,
  activeContentId: null,
  debugZones: true,
  unlockArea: (id) =>
    set((state) => ({
      contentAreas: state.contentAreas.map((area) =>
        area.id === id ? { ...area, unlocked: true } : area
      ),
    })),
  setActiveContent: (id) => set({ activeContentId: id }),
  toggleDebugZones: () => set((state) => ({ debugZones: !state.debugZones })),
}))
