import { useEffect } from 'react'
import { create } from 'zustand'

export type TriggerAction = {
  id: string
  label: string
  handler: () => void
}

type TriggerRegistryState = {
  actions: Record<string, TriggerAction>
  register: (action: TriggerAction) => void
  unregister: (id: string) => void
}

/**
 * Pub/sub registry of "functions" that trigger zones can call by id. Scene components
 * (e.g. a Turntable) register their handlers on mount and unregister on unmount, so the
 * Trigger editor panel can offer a live dropdown of whatever is actually available in the
 * current scene, instead of free-text/eval.
 */
export const useTriggerRegistry = create<TriggerRegistryState>((set) => ({
  actions: {},
  register: (action) => set((state) => ({ actions: { ...state.actions, [action.id]: action } })),
  unregister: (id) =>
    set((state) => {
      if (!(id in state.actions)) return {}
      const rest = { ...state.actions }
      delete rest[id]
      return { actions: rest }
    }),
}))

/**
 * Registers a trigger action for the lifetime of the calling component. Pass a stable
 * handler (wrap it in useCallback) to avoid re-registering every render.
 */
export function useTriggerAction(id: string, label: string, handler: () => void) {
  const register = useTriggerRegistry((s) => s.register)
  const unregister = useTriggerRegistry((s) => s.unregister)

  useEffect(() => {
    register({ id, label, handler })
    return () => unregister(id)
  }, [id, label, handler, register, unregister])
}

/** Fires a registered action by id; no-op (with a dev warning) if nothing is registered under that id. */
export function fireTriggerAction(id: string | null | undefined) {
  if (!id) return
  const action = useTriggerRegistry.getState().actions[id]
  if (!action) {
    console.warn(`[trigger] Keine Aktion registriert für "${id}"`)
    return
  }
  action.handler()
}
