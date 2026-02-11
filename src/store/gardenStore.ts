import { create } from 'zustand'
import { gardenAreas, type GardenArea } from '../data/garden'

type GardenStoreState = {
  areas: GardenArea[]
  unlockArea: (id: string) => void
}

export const useGardenStore = create<GardenStoreState>((set) => ({
  areas: gardenAreas,
  unlockArea: (id) =>
    set((state) => ({
      areas: state.areas.map((area) =>
        area.id === id ? { ...area, unlocked: true } : area
      ),
    })),
}))
