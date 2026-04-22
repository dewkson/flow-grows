export type ContentType = 'text' | 'game' | 'embed' | 'interactive'

export type EmbedVariant = 'soundcloud' | 'itchio'

export type ClickZone = {
  space?: 'world' | 'screen'
  shape: 'circle' | 'rect'
  offset?: [number, number, number]
  radius?: number
  size?: [number, number]
  screenOffset?: [number, number]
  screenRadius?: number
  screenSize?: [number, number]
}

export type LinkedClickZone = {
  id: string
  name: string
  linkedContentId: string
  clickZone: ClickZone
}

export type ContentArea = {
  id: string
  title: string
  description: string
  worldPosition: [number, number, number]
  rotation?: [number, number, number]
  contentType: ContentType
  prefabName?: string
  interactionRadius?: number
  unlocked: boolean
  unlockCondition?: string
  embedUrls?: string[]
  embedVariant?: EmbedVariant
  clickZone?: ClickZone
  panelConfig?: {
    offset?: [number, number, number]
    panelColor?: string
    titleColor?: string
    textColor?: string
  }
}

export const contentAreas: ContentArea[] = [
  {
    id: 'welcome-text',
    title: 'Welcome!',
    description: 'Willkommen in meinem digitalen Garten.\nErkunde und entdecke, was hier wächst.\n\nKlicke hier, um diesen Text zu bearbeiten.',
    worldPosition: [20, 0.12, 20],
    rotation: [0, Math.PI / 4, 0],
    contentType: 'text',
    interactionRadius: 8,
    unlocked: true,
    panelConfig: {
      offset: [8, 0, 10],
      panelColor: '#1e293b',
      titleColor: '#e2e8f0',
      textColor: '#f1f5f9',
    },
  },
  {
    id: 'puzzle-sign',
    title: 'Puzzle',
    description: 'A challenging puzzle awaits.\nCan you solve it?',
    worldPosition: [-20, 0.12, 20],
    rotation: [0, Math.PI / 4, 0],
    contentType: 'text',
    interactionRadius: 6,
    unlocked: true,
    panelConfig: {
      offset: [8, 0, 10],
      panelColor: '#1e293b',
      titleColor: '#e2e8f0',
      textColor: '#f1f5f9',
    },
  },
  {
    id: 'music-monitor',
    title: 'Music Production',
    description: 'Listen to my SoundCloud tracks.',
    worldPosition: [-40, 0.12, -40],
    rotation: [0, Math.PI / 4, 0],
    contentType: 'embed',
    interactionRadius: 10,
    unlocked: true,
    embedUrls: [],
    embedVariant: 'soundcloud',
    panelConfig: {
      offset: [8, 0, 10],
      panelColor: '#1e293b',
      titleColor: '#e2e8f0',
      textColor: '#f1f5f9',
    },
    clickZone: {
      shape: 'rect',
      // Shift to the stamped floor area so the clickable region matches visuals.
      offset: [-12, -0.06, -12],
      size: [16, 16],
    },
  },
  {
    id: 'game-dev-monitor',
    title: 'Game Dev',
    description: 'Play my itch.io games.',
    worldPosition: [30, 0.12, -30],
    rotation: [0, Math.PI / 4, 0],
    contentType: 'embed',
    interactionRadius: 12,
    unlocked: true,
    embedUrls: [],
    embedVariant: 'itchio',
    panelConfig: {
      offset: [8, 0, 10],
      panelColor: '#1e293b',
      titleColor: '#e2e8f0',
      textColor: '#f1f5f9',
    },
    clickZone: {
      shape: 'rect',
      offset: [0, -0.06, 0],
      size: [18, 18],
    },
  },
]

export const defaultLinkedClickZones: LinkedClickZone[] = [
  {
    id: 'zone-music-main',
    name: 'Music Zone',
    linkedContentId: 'music-monitor',
    clickZone: {
      space: 'world',
      shape: 'rect',
      offset: [-12, -0.06, -12],
      size: [16, 16],
    },
  },
  {
    id: 'zone-game-main',
    name: 'Game Zone',
    linkedContentId: 'game-dev-monitor',
    clickZone: {
      space: 'world',
      shape: 'rect',
      offset: [0, -0.06, 0],
      size: [18, 18],
    },
  },
]
