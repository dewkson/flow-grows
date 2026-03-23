export type ContentType = 'text' | 'game' | 'embed' | 'interactive'

export type EmbedVariant = 'soundcloud' | 'itchio'

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
  },
]
