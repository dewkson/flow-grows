export type ContentType = 'text' | 'game' | 'embed' | 'interactive'

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
    id: 'workshop-sign',
    title: 'Workshop',
    description: 'Build and experiment\nwith new ideas.',
    worldPosition: [20, 0.12, -20],
    rotation: [0, Math.PI / 4, 0],
    contentType: 'text',
    interactionRadius: 6,
    unlocked: true,
  },
]
