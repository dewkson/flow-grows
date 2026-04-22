import { create } from 'zustand'
import {
  contentAreas,
  defaultLinkedClickZones,
  type ClickZone,
  type ContentArea,
  type LinkedClickZone,
} from '../data/contentArea'
import type { Collider } from '../data/collider'

const STORAGE_KEY = 'flow-grows-content'
const COLLIDER_STORAGE_KEY = 'flow-grows-colliders'
const EMBED_STORAGE_KEY = 'flow-grows-embeds'
const CLICK_ZONE_STORAGE_KEY = 'flow-grows-click-zones'
const LINKED_CLICK_ZONE_STORAGE_KEY = 'flow-grows-linked-click-zones'
const CONTENT_AREA_META_STORAGE_KEY = 'flow-grows-content-area-meta'

/** Merge saved text overrides into the default content areas */
function loadContentAreas(): ContentArea[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const embedRaw = localStorage.getItem(EMBED_STORAGE_KEY)
    const clickZoneRaw = localStorage.getItem(CLICK_ZONE_STORAGE_KEY)
    const metaRaw = localStorage.getItem(CONTENT_AREA_META_STORAGE_KEY)
    const savedTexts = raw ? (JSON.parse(raw) as Record<string, string>) : null
    const savedEmbeds = embedRaw ? (JSON.parse(embedRaw) as Record<string, string[]>) : null
    const savedClickZones = clickZoneRaw
      ? (JSON.parse(clickZoneRaw) as Record<string, NonNullable<ContentArea['clickZone']>>)
      : null
    const savedMeta = metaRaw ? (JSON.parse(metaRaw) as Record<string, Partial<ContentArea>>) : null
    if (!savedTexts && !savedEmbeds && !savedClickZones && !savedMeta) return contentAreas
    return contentAreas.map((area) => {
      let patched = area
      if (savedMeta && savedMeta[area.id] !== undefined) {
        patched = { ...patched, ...savedMeta[area.id] }
      }
      if (savedTexts && savedTexts[area.id] !== undefined) {
        patched = { ...patched, description: savedTexts[area.id] }
      }
      if (savedEmbeds && savedEmbeds[area.id] !== undefined) {
        patched = { ...patched, embedUrls: savedEmbeds[area.id] }
      }
      if (savedClickZones && savedClickZones[area.id] !== undefined) {
        patched = { ...patched, clickZone: savedClickZones[area.id] }
      }
      return patched
    })
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

function saveEmbedUrls(areas: ContentArea[]) {
  const map: Record<string, string[]> = {}
  for (const area of areas) {
    if (area.embedUrls) map[area.id] = area.embedUrls
  }
  localStorage.setItem(EMBED_STORAGE_KEY, JSON.stringify(map))
}

function saveClickZones(areas: ContentArea[]) {
  const map: Record<string, NonNullable<ContentArea['clickZone']>> = {}
  for (const area of areas) {
    if (area.clickZone) map[area.id] = area.clickZone
  }
  localStorage.setItem(CLICK_ZONE_STORAGE_KEY, JSON.stringify(map))
}

function loadLinkedClickZones(): LinkedClickZone[] {
  try {
    const raw = localStorage.getItem(LINKED_CLICK_ZONE_STORAGE_KEY)
    if (!raw) return defaultLinkedClickZones
    const parsed = JSON.parse(raw) as LinkedClickZone[]
    if (!Array.isArray(parsed)) return defaultLinkedClickZones
    return parsed
  } catch {
    return defaultLinkedClickZones
  }
}

function saveLinkedClickZones(zones: LinkedClickZone[]) {
  localStorage.setItem(LINKED_CLICK_ZONE_STORAGE_KEY, JSON.stringify(zones))
}

function saveContentAreaMeta(areas: ContentArea[]) {
  const map: Record<string, Partial<ContentArea>> = {}
  for (const area of areas) {
    map[area.id] = {
      title: area.title,
      worldPosition: area.worldPosition,
      interactionRadius: area.interactionRadius,
      panelConfig: area.panelConfig,
    }
  }
  localStorage.setItem(CONTENT_AREA_META_STORAGE_KEY, JSON.stringify(map))
}

type GardenStoreState = {
  contentAreas: ContentArea[]
  activeContentId: string | null
  showHintZones: boolean
  showHotspotZones: boolean
  cameraDragLocked: boolean
  activeEditorPanel: 'none' | 'colliders' | 'clickzones' | 'hints'
  editorMode: boolean
  isEditingText: boolean
  isEmbedOpen: boolean
  activeEmbedContentId: string | null
  linkedClickZones: LinkedClickZone[]
  colliders: Collider[]
  selectedColliderId: string | null
  unlockArea: (id: string) => void
  setActiveContent: (id: string | null) => void
  toggleHintZones: () => void
  toggleHotspotZones: () => void
  setCameraDragLocked: (locked: boolean) => void
  setActiveEditorPanel: (panel: 'none' | 'colliders' | 'clickzones' | 'hints') => void
  toggleEditorMode: () => void
  setIsEditingText: (editing: boolean) => void
  updateContentAreaMeta: (id: string, patch: Partial<Pick<ContentArea, 'title' | 'worldPosition' | 'interactionRadius' | 'panelConfig'>>) => void
  updateContentText: (id: string, description: string) => void
  openEmbedPanel: (contentId: string) => void
  closeEmbedPanel: () => void
  updateEmbedUrls: (contentId: string, urls: string[]) => void
  updateClickZone: (contentId: string, clickZone: NonNullable<ContentArea['clickZone']>) => void
  addLinkedClickZone: (zone?: Partial<LinkedClickZone>) => void
  updateLinkedClickZone: (id: string, patch: Partial<Omit<LinkedClickZone, 'id'>>) => void
  updateLinkedClickZoneShape: (id: string, patch: Partial<ClickZone>) => void
  removeLinkedClickZone: (id: string) => void
  addCollider: (collider: Collider) => void
  removeCollider: (id: string) => void
  updateCollider: (id: string, patch: Partial<Pick<Collider, 'position' | 'size'>>) => void
  selectCollider: (id: string | null) => void
}

export const useGardenStore = create<GardenStoreState>((set) => ({
  contentAreas: loadContentAreas(),
  activeContentId: null,
  showHintZones: false,
  showHotspotZones: false,
  cameraDragLocked: false,
  activeEditorPanel: 'none',
  editorMode: false,
  isEditingText: false,
  isEmbedOpen: false,
  activeEmbedContentId: null,
  linkedClickZones: loadLinkedClickZones(),
  colliders: loadColliders(),
  selectedColliderId: null,
  unlockArea: (id) =>
    set((state) => ({
      contentAreas: state.contentAreas.map((area) =>
        area.id === id ? { ...area, unlocked: true } : area
      ),
    })),
  setActiveContent: (id) => set({ activeContentId: id }),
  toggleHintZones: () => set((state) => ({ showHintZones: !state.showHintZones })),
  toggleHotspotZones: () => set((state) => ({ showHotspotZones: !state.showHotspotZones })),
  setCameraDragLocked: (locked) => set({ cameraDragLocked: locked }),
  setActiveEditorPanel: (panel) => set({ activeEditorPanel: panel }),
  toggleEditorMode: () =>
    set((state) => {
      const nextEditorMode = !state.editorMode
      return {
        editorMode: nextEditorMode,
        activeEditorPanel: nextEditorMode ? state.activeEditorPanel : 'none',
      }
    }),
  setIsEditingText: (editing) => set({ isEditingText: editing }),
  updateContentAreaMeta: (id, patch) =>
    set((state) => {
      const updated = state.contentAreas.map((area) =>
        area.id === id
          ? {
              ...area,
              ...patch,
              panelConfig: {
                ...area.panelConfig,
                ...patch.panelConfig,
              },
            }
          : area,
      )
      saveContentAreaMeta(updated)
      return { contentAreas: updated }
    }),
  openEmbedPanel: (contentId) => set({ isEmbedOpen: true, activeEmbedContentId: contentId }),
  closeEmbedPanel: () => set({ isEmbedOpen: false, activeEmbedContentId: null }),
  updateEmbedUrls: (contentId, urls) =>
    set((state) => {
      const updated = state.contentAreas.map((area) =>
        area.id === contentId ? { ...area, embedUrls: urls } : area
      )
      saveEmbedUrls(updated)
      return { contentAreas: updated }
    }),
  updateClickZone: (contentId, clickZone) =>
    set((state) => {
      const updated = state.contentAreas.map((area) =>
        area.id === contentId ? { ...area, clickZone } : area
      )
      saveClickZones(updated)
      return { contentAreas: updated }
    }),
  addLinkedClickZone: (zone) =>
    set((state) => {
      const fallbackContentId = state.contentAreas[0]?.id ?? 'welcome-text'
      const newZone: LinkedClickZone = {
        id: `zone-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: zone?.name ?? 'Neue Klickzone',
        linkedContentId: zone?.linkedContentId ?? fallbackContentId,
        clickZone: zone?.clickZone ?? {
          space: 'world',
          shape: 'rect',
          offset: [0, -0.06, 0],
          size: [10, 10],
          screenOffset: [0, 0],
          screenSize: [120, 120],
        },
      }
      const updated = [...state.linkedClickZones, newZone]
      saveLinkedClickZones(updated)
      return { linkedClickZones: updated }
    }),
  updateLinkedClickZone: (id, patch) =>
    set((state) => {
      const updated = state.linkedClickZones.map((zone) =>
        zone.id === id ? { ...zone, ...patch } : zone,
      )
      saveLinkedClickZones(updated)
      return { linkedClickZones: updated }
    }),
  updateLinkedClickZoneShape: (id, patch) =>
    set((state) => {
      const updated = state.linkedClickZones.map((zone) =>
        zone.id === id
          ? {
              ...zone,
              clickZone: {
                ...zone.clickZone,
                ...patch,
              },
            }
          : zone,
      )
      saveLinkedClickZones(updated)
      return { linkedClickZones: updated }
    }),
  removeLinkedClickZone: (id) =>
    set((state) => {
      const updated = state.linkedClickZones.filter((zone) => zone.id !== id)
      saveLinkedClickZones(updated)
      return { linkedClickZones: updated }
    }),
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
