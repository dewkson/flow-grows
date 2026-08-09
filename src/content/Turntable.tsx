import { useRef, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTriggerAction } from '../systems/triggerRegistry'

const BASE_COLOR = new THREE.Color('#3f3f46')
const DISC_COLOR = new THREE.Color('#111827')

type TurntableProps = {
  position?: [number, number, number]
  /** Optional track URL; without one the disc still spins, just silently. */
  audioUrl?: string
}

/**
 * Example wiring for the Trigger feature: registers 'turntable:play' / 'turntable:pause'
 * as trigger actions (pick them in the Trigger panel's "Beim Betreten"/"Beim Verlassen"
 * dropdowns), spins the record while playing and plays/pauses the optional audio track.
 */
export function Turntable({ position = [0, 0, 0], audioUrl }: TurntableProps) {
  const [spinning, setSpinning] = useState(false)
  const discRef = useRef<THREE.Mesh>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const play = useCallback(() => {
    setSpinning(true)
    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl)
        audioRef.current.loop = true
      }
      audioRef.current.play().catch(() => {})
    }
  }, [audioUrl])

  const pause = useCallback(() => {
    setSpinning(false)
    audioRef.current?.pause()
  }, [])

  useTriggerAction('turntable:play', 'Plattenspieler: Play', play)
  useTriggerAction('turntable:pause', 'Plattenspieler: Pause', pause)

  useFrame((_, delta) => {
    if (spinning && discRef.current) {
      discRef.current.rotation.y += delta * 4
    }
  })

  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.2, 1.2, 0.1, 32]} />
        <meshStandardMaterial color={BASE_COLOR} />
      </mesh>
      <mesh ref={discRef} position={[0, 0.11, 0]} castShadow>
        <cylinderGeometry args={[1, 1, 0.02, 32]} />
        <meshStandardMaterial color={DISC_COLOR} />
      </mesh>
    </group>
  )
}
