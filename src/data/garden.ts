export type GardenArea = {
  id: string
  title: string
  position: [number, number] // [x, z]
  size: number
  unlocked: boolean
  unlockCondition?: string
  contentType: 'text' | 'game' | 'embed'
}

export const gardenAreas: GardenArea[] = [
  {
    id: 'welcome',
    title: 'Welcome Garden',
    position: [0, 0],
    size: 3,
    unlocked: true,
    contentType: 'text',
  },
  {
    id: 'puzzle',
    title: 'Puzzle Grove',
    position: [5, 5],
    size: 2,
    unlocked: false,
    unlockCondition: 'Complete the welcome quest',
    contentType: 'game',
  },
  {
    id: 'puzzle',
    title: 'Puzzle Grove',
    position: [5, -5],
    size: 1.5,
    unlocked: false,
    unlockCondition: 'Complete the welcome quest',
    contentType: 'game',
  },
]
