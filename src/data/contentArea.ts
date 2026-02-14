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
    description: '... to my digital garden.\nExplore and discover what grows here.',
    worldPosition: [8, 0.12, 8],
    rotation: [0, Math.PI / 4, 0],
    contentType: 'text',
    interactionRadius: 8,
    unlocked: true,
  },
  {
    id: 'puzzle-sign',
    title: 'Puzzle',
    description: 'A challenging puzzle awaits.\nCan you solve it?',
    worldPosition: [-10, 0.12, 10],
    rotation: [0, Math.PI / 4, 0],
    contentType: 'game',
    interactionRadius: 6,
    unlocked: false,
    unlockCondition: 'Complete the welcome quest',
  },
  {
    id: 'workshop-sign',
    title: 'Workshop',
    description: 'Build and experiment\nwith new ideas.',
    worldPosition: [10, 0.12, -10],
    rotation: [0, Math.PI / 4, 0],
    contentType: 'embed',
    interactionRadius: 6,
    unlocked: false,
    unlockCondition: 'Complete the welcome quest',
  },
]
