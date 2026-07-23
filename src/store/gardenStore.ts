import { create } from 'zustand'
import {
  contentAreas,
  defaultLinkedClickZones,
  type ClickZone,
  type ContentArea,
  type LinkedClickZone,
} from '../data/contentArea'
import type { Collider } from '../data/collider'
import type { PlacedModel } from '../data/placedModel'

const STORAGE_KEY = 'flow-grows-content'
const COLLIDER_STORAGE_KEY = 'flow-grows-colliders'
const PLACED_MODELS_STORAGE_KEY = 'flow-grows-placed-models'
const EMBED_STORAGE_KEY = 'flow-grows-embeds'
const CLICK_ZONE_STORAGE_KEY = 'flow-grows-click-zones'
const LINKED_CLICK_ZONE_STORAGE_KEY = 'flow-grows-linked-click-zones'
const CONTENT_AREA_META_STORAGE_KEY = 'flow-grows-content-area-meta'
const GARDENS_STORAGE_KEY = 'flow-grows-gardens'
const ACTIVE_GARDEN_KEY = 'flow-grows-active-garden'
const SPRITE_SETUP_KEY = 'flow-grows-sprite-setup'
const MOTION_THRESHOLDS_KEY = 'flow-grows-motion-thresholds'
const CHARACTER_LERP_SPEED_KEY = 'flow-grows-character-lerp-speed'
const CHARACTER_MAX_SPEED_KEY = 'flow-grows-character-max-speed'
const CHARACTER_FOLLOW_DEADZONE_KEY = 'flow-grows-character-follow-deadzone'
const CHARACTER_FOLLOW_CATCH_UP_KEY = 'flow-grows-character-follow-catch-up'

export type SpriteConfig = {
  url: string
  position: [number, number, number]
  scale?: number
  stretchFactor?: number
  renderOrder?: number
  depthTest?: boolean
  receiveShadow?: boolean
}

export type GardenSnapshot = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  spriteSetup: SpriteConfig[]
  contentAreas: ContentArea[]
  colliders: Collider[]
  linkedClickZones: LinkedClickZone[]
  placedModels: PlacedModel[]
}

type ColliderUndoSnapshot = {
  id: string
  position: [number, number]
  size: [number, number]
  radius: number
  rotationY: number
  shape: Collider['shape']
}

type UpdateColliderOptions = {
  recordUndo?: boolean
}

/** Speed thresholds (world units/sec) driving the character's idle/walk/run animation state, with hysteresis. */
export type MotionThresholds = {
  walkEnter: number
  walkExit: number
  runEnter: number
  runExit: number
}

export const DEFAULT_SPRITE_SETUP: SpriteConfig[] = [
  { url: '/sprites/whole.png', position: [0, 0, 0], scale: 50 },
]

export const DEFAULT_MOTION_THRESHOLDS: MotionThresholds = {
  walkEnter: 0.5,
  walkExit: 0.3,
  runEnter: 6,
  runExit: 4,
}

/** How fast the character catches up to its target position each frame (0 = never, 1 = instant). */
export const DEFAULT_CHARACTER_LERP_SPEED = 0.1

/** Hard cap on movement speed (world units/sec), independent of the lerp factor. */
export const DEFAULT_CHARACTER_MAX_SPEED = 12

/**
 * "Activation energy" for movement: while resting, the camera-derived target must move
 * further than this radius (world units) away from the character before it starts
 * following at all – tiny swipes never move the character or trigger animation.
 */
export const DEFAULT_CHARACTER_FOLLOW_DEADZONE = 0.2

/**
 * Once following, the character keeps chasing the target continuously (ignoring the
 * enter radius above) until the remaining distance drops below this much smaller value –
 * i.e. it has essentially caught up – before returning to the resting state. This
 * hysteresis (separate enter/exit thresholds, same pattern as MotionThresholds) prevents
 * the stop/go flicker that a single shared threshold would cause during a slow, continuous
 * drag.
 */
export const DEFAULT_CHARACTER_FOLLOW_CATCH_UP = 0.03

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
    const parsed = JSON.parse(raw) as Partial<Collider>[]
    if (!Array.isArray(parsed)) return []
    // Migrate colliders saved before shape/rotation/radius existed
    return parsed.map((c) => ({
      id: c.id!,
      position: c.position!,
      size: c.size ?? [4, 4],
      radius: c.radius ?? (c.size ? c.size[0] / 2 : 2),
      rotationY: c.rotationY ?? 0,
      shape: c.shape ?? 'box',
    }))
  } catch {
    return []
  }
}

function saveColliders(colliders: Collider[]) {
  localStorage.setItem(COLLIDER_STORAGE_KEY, JSON.stringify(colliders))
}

function loadPlacedModels(): PlacedModel[] {
  try {
    const raw = localStorage.getItem(PLACED_MODELS_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as PlacedModel[]
  } catch {
    return []
  }
}

function savePlacedModels(placedModels: PlacedModel[]) {
  localStorage.setItem(PLACED_MODELS_STORAGE_KEY, JSON.stringify(placedModels))
}

function loadSpriteSetup(): SpriteConfig[] {
  try {
    const raw = localStorage.getItem(SPRITE_SETUP_KEY)
    if (!raw) return DEFAULT_SPRITE_SETUP
    const parsed = JSON.parse(raw) as SpriteConfig[]
    return Array.isArray(parsed) ? parsed : DEFAULT_SPRITE_SETUP
  } catch {
    return DEFAULT_SPRITE_SETUP
  }
}

function saveSpriteSetup(setup: SpriteConfig[]) {
  localStorage.setItem(SPRITE_SETUP_KEY, JSON.stringify(setup))
}

function loadGardens(): GardenSnapshot[] {
  try {
    const raw = localStorage.getItem(GARDENS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as GardenSnapshot[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveGardens(gardens: GardenSnapshot[]) {
  localStorage.setItem(GARDENS_STORAGE_KEY, JSON.stringify(gardens))
}

function loadMotionThresholds(): MotionThresholds {
  try {
    const raw = localStorage.getItem(MOTION_THRESHOLDS_KEY)
    if (!raw) return DEFAULT_MOTION_THRESHOLDS
    const parsed = JSON.parse(raw) as Partial<MotionThresholds>
    return { ...DEFAULT_MOTION_THRESHOLDS, ...parsed }
  } catch {
    return DEFAULT_MOTION_THRESHOLDS
  }
}

function saveMotionThresholds(thresholds: MotionThresholds) {
  localStorage.setItem(MOTION_THRESHOLDS_KEY, JSON.stringify(thresholds))
}

function loadCharacterLerpSpeed(): number {
  try {
    const raw = localStorage.getItem(CHARACTER_LERP_SPEED_KEY)
    if (!raw) return DEFAULT_CHARACTER_LERP_SPEED
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : DEFAULT_CHARACTER_LERP_SPEED
  } catch {
    return DEFAULT_CHARACTER_LERP_SPEED
  }
}

function saveCharacterLerpSpeed(speed: number) {
  localStorage.setItem(CHARACTER_LERP_SPEED_KEY, String(speed))
}

function loadCharacterMaxSpeed(): number {
  try {
    const raw = localStorage.getItem(CHARACTER_MAX_SPEED_KEY)
    if (!raw) return DEFAULT_CHARACTER_MAX_SPEED
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : DEFAULT_CHARACTER_MAX_SPEED
  } catch {
    return DEFAULT_CHARACTER_MAX_SPEED
  }
}

function saveCharacterMaxSpeed(speed: number) {
  localStorage.setItem(CHARACTER_MAX_SPEED_KEY, String(speed))
}

function loadCharacterFollowDeadzone(): number {
  try {
    const raw = localStorage.getItem(CHARACTER_FOLLOW_DEADZONE_KEY)
    if (!raw) return DEFAULT_CHARACTER_FOLLOW_DEADZONE
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : DEFAULT_CHARACTER_FOLLOW_DEADZONE
  } catch {
    return DEFAULT_CHARACTER_FOLLOW_DEADZONE
  }
}

function saveCharacterFollowDeadzone(radius: number) {
  localStorage.setItem(CHARACTER_FOLLOW_DEADZONE_KEY, String(radius))
}

function loadCharacterFollowCatchUp(): number {
  try {
    const raw = localStorage.getItem(CHARACTER_FOLLOW_CATCH_UP_KEY)
    if (!raw) return DEFAULT_CHARACTER_FOLLOW_CATCH_UP
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : DEFAULT_CHARACTER_FOLLOW_CATCH_UP
  } catch {
    return DEFAULT_CHARACTER_FOLLOW_CATCH_UP
  }
}

function saveCharacterFollowCatchUp(distance: number) {
  localStorage.setItem(CHARACTER_FOLLOW_CATCH_UP_KEY, String(distance))
}

function loadActiveGardenId(): string | null {
  return localStorage.getItem(ACTIVE_GARDEN_KEY)
}

function saveActiveGardenId(id: string | null) {
  if (id === null) {
    localStorage.removeItem(ACTIVE_GARDEN_KEY)
  } else {
    localStorage.setItem(ACTIVE_GARDEN_KEY, id)
  }
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
  activeEditorPanel: 'none' | 'colliders' | 'clickzones' | 'hints' | 'motion' | 'models'
  editorMode: boolean
  isEditingText: boolean
  isEmbedOpen: boolean
  activeEmbedContentId: string | null
  linkedClickZones: LinkedClickZone[]
  colliders: Collider[]
  selectedColliderId: string | null
  lastColliderUndo: ColliderUndoSnapshot | null
  canUndoColliderChange: boolean
  placedModels: PlacedModel[]
  selectedPlacedModelId: string | null
  spriteSetup: SpriteConfig[]
  gardens: GardenSnapshot[]
  activeGardenId: string | null
  motionThresholds: MotionThresholds
  setMotionThresholds: (patch: Partial<MotionThresholds>) => void
  characterLerpSpeed: number
  setCharacterLerpSpeed: (speed: number) => void
  characterMaxSpeed: number
  setCharacterMaxSpeed: (speed: number) => void
  characterFollowDeadzone: number
  setCharacterFollowDeadzone: (radius: number) => void
  characterFollowCatchUp: number
  setCharacterFollowCatchUp: (distance: number) => void
  unlockArea: (id: string) => void
  setActiveContent: (id: string | null) => void
  toggleHintZones: () => void
  toggleHotspotZones: () => void
  setCameraDragLocked: (locked: boolean) => void
  setActiveEditorPanel: (panel: 'none' | 'colliders' | 'clickzones' | 'hints' | 'motion' | 'models') => void
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
  setColliderUndoSnapshot: (id: string) => void
  undoLastColliderChange: () => void
  updateCollider: (
    id: string,
    patch: Partial<Pick<Collider, 'position' | 'size' | 'radius' | 'rotationY' | 'shape'>>,
    options?: UpdateColliderOptions,
  ) => void
  selectCollider: (id: string | null) => void
  addPlacedModel: (model: PlacedModel) => void
  removePlacedModel: (id: string) => void
  updatePlacedModel: (id: string, patch: Partial<Pick<PlacedModel, 'position' | 'positionY' | 'rotationY' | 'scale'>>) => void
  selectPlacedModel: (id: string | null) => void
  setSpriteSetup: (setup: SpriteConfig[]) => void
  saveCurrentAsGarden: (name: string) => void
  overwriteCurrentGarden: () => void
  loadGarden: (id: string) => void
  deleteGarden: (id: string) => void
  renameGarden: (id: string, name: string) => void
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
  lastColliderUndo: null,
  canUndoColliderChange: false,
  placedModels: loadPlacedModels(),
  selectedPlacedModelId: null,
  spriteSetup: loadSpriteSetup(),
  gardens: loadGardens(),
  activeGardenId: loadActiveGardenId(),
  motionThresholds: loadMotionThresholds(),
  setMotionThresholds: (patch) =>
    set((state) => {
      const updated = { ...state.motionThresholds, ...patch }
      saveMotionThresholds(updated)
      return { motionThresholds: updated }
    }),
  characterLerpSpeed: loadCharacterLerpSpeed(),
  setCharacterLerpSpeed: (speed) => {
    saveCharacterLerpSpeed(speed)
    set({ characterLerpSpeed: speed })
  },
  characterMaxSpeed: loadCharacterMaxSpeed(),
  setCharacterMaxSpeed: (speed) => {
    saveCharacterMaxSpeed(speed)
    set({ characterMaxSpeed: speed })
  },
  characterFollowDeadzone: loadCharacterFollowDeadzone(),
  setCharacterFollowDeadzone: (radius) => {
    saveCharacterFollowDeadzone(radius)
    set({ characterFollowDeadzone: radius })
  },
  characterFollowCatchUp: loadCharacterFollowCatchUp(),
  setCharacterFollowCatchUp: (distance) => {
    saveCharacterFollowCatchUp(distance)
    set({ characterFollowCatchUp: distance })
  },
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
      return { colliders: updated, lastColliderUndo: null, canUndoColliderChange: false }
    }),
  removeCollider: (id) =>
    set((state) => {
      const updated = state.colliders.filter((c) => c.id !== id)
      const shouldResetUndo = state.lastColliderUndo?.id === id
      saveColliders(updated)
      return {
        colliders: updated,
        selectedColliderId: state.selectedColliderId === id ? null : state.selectedColliderId,
        lastColliderUndo: shouldResetUndo ? null : state.lastColliderUndo,
        canUndoColliderChange: shouldResetUndo ? false : state.canUndoColliderChange,
      }
    }),
  setColliderUndoSnapshot: (id) =>
    set((state) => {
      const collider = state.colliders.find((c) => c.id === id)
      if (!collider) return {}
      return {
        lastColliderUndo: {
          id: collider.id,
          position: [...collider.position] as [number, number],
          size: [...collider.size] as [number, number],
          radius: collider.radius,
          rotationY: collider.rotationY,
          shape: collider.shape,
        },
        canUndoColliderChange: true,
      }
    }),
  undoLastColliderChange: () =>
    set((state) => {
      const snapshot = state.lastColliderUndo
      if (!snapshot) return {}

      const idx = state.colliders.findIndex((c) => c.id === snapshot.id)
      if (idx < 0) {
        return { lastColliderUndo: null, canUndoColliderChange: false }
      }

      const updated = [...state.colliders]
      updated[idx] = {
        ...updated[idx],
        position: [...snapshot.position],
        size: [...snapshot.size],
        radius: snapshot.radius,
        rotationY: snapshot.rotationY,
        shape: snapshot.shape,
      }
      saveColliders(updated)

      return {
        colliders: updated,
        selectedColliderId: snapshot.id,
        lastColliderUndo: null,
        canUndoColliderChange: false,
      }
    }),
  updateCollider: (id, patch, options) =>
    set((state) => {
      const current = state.colliders.find((c) => c.id === id)
      if (!current) return {}

      const updated = state.colliders.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      )
      saveColliders(updated)

      const shouldRecordUndo = options?.recordUndo ?? true
      if (!shouldRecordUndo) {
        return { colliders: updated }
      }

      return {
        colliders: updated,
        lastColliderUndo: {
          id: current.id,
          position: [...current.position] as [number, number],
          size: [...current.size] as [number, number],
          radius: current.radius,
          rotationY: current.rotationY,
          shape: current.shape,
        },
        canUndoColliderChange: true,
      }
    }),
  selectCollider: (id) => set({ selectedColliderId: id }),
  addPlacedModel: (model) =>
    set((state) => {
      const updated = [...state.placedModels, model]
      savePlacedModels(updated)
      return { placedModels: updated }
    }),
  removePlacedModel: (id) =>
    set((state) => {
      const updated = state.placedModels.filter((m) => m.id !== id)
      savePlacedModels(updated)
      return {
        placedModels: updated,
        selectedPlacedModelId: state.selectedPlacedModelId === id ? null : state.selectedPlacedModelId,
      }
    }),
  updatePlacedModel: (id, patch) =>
    set((state) => {
      const updated = state.placedModels.map((m) => (m.id === id ? { ...m, ...patch } : m))
      savePlacedModels(updated)
      return { placedModels: updated }
    }),
  selectPlacedModel: (id) => set({ selectedPlacedModelId: id }),
  setSpriteSetup: (setup) => {
    saveSpriteSetup(setup)
    set({ spriteSetup: setup })
  },
  saveCurrentAsGarden: (name) =>
    set((state) => {
      const now = Date.now()
      const newGarden: GardenSnapshot = {
        id: `garden-${now}`,
        name,
        createdAt: now,
        updatedAt: now,
        spriteSetup: state.spriteSetup,
        contentAreas: state.contentAreas,
        colliders: state.colliders,
        linkedClickZones: state.linkedClickZones,
        placedModels: state.placedModels,
      }
      const updated = [...state.gardens, newGarden]
      saveGardens(updated)
      saveActiveGardenId(newGarden.id)
      return { gardens: updated, activeGardenId: newGarden.id }
    }),
  overwriteCurrentGarden: () =>
    set((state) => {
      if (!state.activeGardenId) return {}
      const now = Date.now()
      const updated = state.gardens.map((g) =>
        g.id === state.activeGardenId
          ? {
              ...g,
              updatedAt: now,
              spriteSetup: state.spriteSetup,
              contentAreas: state.contentAreas,
              colliders: state.colliders,
              linkedClickZones: state.linkedClickZones,
              placedModels: state.placedModels,
            }
          : g,
      )
      saveGardens(updated)
      return { gardens: updated }
    }),
  loadGarden: (id) =>
    set((state) => {
      const garden = state.gardens.find((g) => g.id === id)
      if (!garden) return {}

      // Persist all individual keys so page reloads also use the correct data
      saveSpriteSetup(garden.spriteSetup)
      saveColliders(garden.colliders)
      savePlacedModels(garden.placedModels ?? [])
      saveLinkedClickZones(garden.linkedClickZones)

      // Persist content area data
      const textMap: Record<string, string> = {}
      const embedMap: Record<string, string[]> = {}
      const clickZoneMap: Record<string, NonNullable<ContentArea['clickZone']>> = {}
      const metaMap: Record<string, Partial<ContentArea>> = {}
      for (const area of garden.contentAreas) {
        textMap[area.id] = area.description
        if (area.embedUrls) embedMap[area.id] = area.embedUrls
        if (area.clickZone) clickZoneMap[area.id] = area.clickZone
        metaMap[area.id] = {
          title: area.title,
          worldPosition: area.worldPosition,
          interactionRadius: area.interactionRadius,
          panelConfig: area.panelConfig,
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(textMap))
      localStorage.setItem(EMBED_STORAGE_KEY, JSON.stringify(embedMap))
      localStorage.setItem(CLICK_ZONE_STORAGE_KEY, JSON.stringify(clickZoneMap))
      localStorage.setItem(CONTENT_AREA_META_STORAGE_KEY, JSON.stringify(metaMap))
      saveActiveGardenId(id)

      return {
        spriteSetup: garden.spriteSetup,
        contentAreas: garden.contentAreas,
        colliders: garden.colliders,
        linkedClickZones: garden.linkedClickZones,
        placedModels: garden.placedModels ?? [],
        activeGardenId: id,
        activeContentId: null,
        selectedColliderId: null,
        lastColliderUndo: null,
        canUndoColliderChange: false,
        selectedPlacedModelId: null,
      }
    }),
  deleteGarden: (id) =>
    set((state) => {
      const updated = state.gardens.filter((g) => g.id !== id)
      saveGardens(updated)
      const nextActiveId = state.activeGardenId === id ? null : state.activeGardenId
      saveActiveGardenId(nextActiveId)
      return { gardens: updated, activeGardenId: nextActiveId }
    }),
  renameGarden: (id, name) =>
    set((state) => {
      const updated = state.gardens.map((g) =>
        g.id === id ? { ...g, name, updatedAt: Date.now() } : g,
      )
      saveGardens(updated)
      return { gardens: updated }
    }),
}))
