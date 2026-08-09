import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGardenStore } from '../store/gardenStore'
import { characterPosition } from '../character/characterPosition'
import { isPointInsideShape } from '../character/collision'
import { fireTriggerAction } from '../systems/triggerRegistry'

/**
 * Always-mounted (regardless of editor mode) logic component: watches the character
 * position against every TriggerZone and fires the configured enter/exit action on the
 * outside<->inside edge. Renders nothing – purely a side-effect loop, kept separate from
 * TriggerSystem (which only handles the editor-mode visuals/handles).
 */
export function TriggerRuntime() {
  const triggers = useGardenStore((s) => s.triggers)
  // Per-trigger runtime bookkeeping that must NOT trigger re-renders.
  const insideRef = useRef<Record<string, boolean>>({})
  const cooldownUntilRef = useRef<Record<string, number>>({})
  const firedOnceRef = useRef<Record<string, { enter?: boolean; exit?: boolean }>>({})

  useFrame((state) => {
    const now = state.clock.elapsedTime

    for (const trigger of triggers) {
      const wasInside = insideRef.current[trigger.id] ?? false
      const isInside = isPointInsideShape(characterPosition.x, characterPosition.z, trigger)

      if (isInside === wasInside) continue
      insideRef.current[trigger.id] = isInside

      const cooldownUntil = cooldownUntilRef.current[trigger.id] ?? 0
      if (now < cooldownUntil) continue

      const edge = isInside ? 'enter' : 'exit'
      const fired = firedOnceRef.current[trigger.id] ?? {}
      if (trigger.once && fired[edge]) continue

      const actionId = isInside ? trigger.onEnterActionId : trigger.onExitActionId
      fireTriggerAction(actionId)

      cooldownUntilRef.current[trigger.id] = now + trigger.cooldownSec
      firedOnceRef.current[trigger.id] = { ...fired, [edge]: true }
    }
  })

  return null
}
