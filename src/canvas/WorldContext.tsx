import { createContext, useContext, useState, ReactNode } from 'react'
import * as THREE from 'three'

interface WorldContextType {
  worldPosition: THREE.Vector3
  setWorldPosition: (position: THREE.Vector3) => void
}

const WorldContext = createContext<WorldContextType | undefined>(undefined)

export function WorldProvider({ children }: { children: ReactNode }) {
  const [worldPosition, setWorldPosition] = useState(new THREE.Vector3(0, 0, 0))

  return (
    <WorldContext.Provider value={{ worldPosition, setWorldPosition }}>
      {children}
    </WorldContext.Provider>
  )
}

export function useWorldPosition() {
  const context = useContext(WorldContext)
  if (!context) {
    throw new Error('useWorldPosition must be used within WorldProvider')
  }
  return context
}
