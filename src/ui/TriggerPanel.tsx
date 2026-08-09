import { useEffect, useState } from 'react'
import { useGardenStore } from '../store/gardenStore'
import { createTriggerZone } from '../data/trigger'
import type { TriggerZone } from '../data/trigger'
import { characterPosition, usePolledCharacterPosition } from '../character/characterPosition'
import { EDITOR_LIST_RADIUS } from '../world/constants'
import { useTriggerRegistry } from '../systems/triggerRegistry'

const NONE_ACTION = '__none__'

export function TriggerPanel() {
  const editorMode = useGardenStore((s) => s.editorMode)
  const activeEditorPanel = useGardenStore((s) => s.activeEditorPanel)
  const setActiveEditorPanel = useGardenStore((s) => s.setActiveEditorPanel)
  const triggers = useGardenStore((s) => s.triggers)
  const selectedId = useGardenStore((s) => s.selectedTriggerId)
  const addTrigger = useGardenStore((s) => s.addTrigger)
  const removeTrigger = useGardenStore((s) => s.removeTrigger)
  const updateTrigger = useGardenStore((s) => s.updateTrigger)
  const setTriggerUndoSnapshot = useGardenStore((s) => s.setTriggerUndoSnapshot)
  const undoLastTriggerChange = useGardenStore((s) => s.undoLastTriggerChange)
  const canUndoTriggerChange = useGardenStore((s) => s.canUndoTriggerChange)
  const selectTrigger = useGardenStore((s) => s.selectTrigger)

  const registeredActions = useTriggerRegistry((s) => s.actions)

  const [showAll, setShowAll] = useState(false)
  const isOpen = editorMode && activeEditorPanel === 'triggers'
  const livePos = usePolledCharacterPosition(isOpen && !showAll)

  useEffect(() => {
    if (!editorMode || activeEditorPanel !== 'triggers') return

    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return

      const target = event.target as HTMLElement | null
      const tagName = target?.tagName
      const isTypingTarget =
        target?.isContentEditable ||
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT'
      if (isTypingTarget) return
      if (!useGardenStore.getState().canUndoTriggerChange) return

      event.preventDefault()
      useGardenStore.getState().undoLastTriggerChange()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editorMode, activeEditorPanel])

  if (!editorMode || activeEditorPanel !== 'triggers') return null

  const selected = triggers.find((t) => t.id === selectedId)
  const actionOptions = Object.values(registeredActions)

  const visibleTriggers = showAll
    ? triggers
    : triggers.filter((t) => {
        if (t.id === selectedId) return true
        const dx = livePos.x - t.position[0]
        const dz = livePos.z - t.position[1]
        return dx * dx + dz * dz <= EDITOR_LIST_RADIUS * EDITOR_LIST_RADIUS
      })

  const handleAdd = () => {
    const x = Math.round(characterPosition.x)
    const z = Math.round(characterPosition.z)
    const trigger = createTriggerZone(x, z, 4, 4)
    addTrigger(trigger)
    selectTrigger(trigger.id)
  }

  const actionLabel = (id: string | null) => {
    if (!id) return null
    return registeredActions[id]?.label ?? `${id} (nicht aktiv)`
  }

  return (
    <div
      data-no-camera-drag="true"
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 1000,
        background: 'rgba(30, 30, 30, 0.92)',
        backdropFilter: 'blur(8px)',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 13,
        minWidth: 240,
        maxHeight: '50vh',
        overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <strong style={{ fontSize: 14 }}>
          Trigger ({showAll ? triggers.length : `${visibleTriggers.length}/${triggers.length}`})
        </strong>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={handleAdd}
            style={{
              background: '#6366f1',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              padding: '4px 12px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            + Hinzufügen
          </button>
          <button
            onClick={undoLastTriggerChange}
            disabled={!canUndoTriggerChange}
            title="Rückgängig (Ctrl/Cmd+Z)"
            style={{
              background: canUndoTriggerChange ? 'rgba(59, 130, 246, 0.85)' : 'rgba(59, 130, 246, 0.3)',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              padding: '4px 10px',
              cursor: canUndoTriggerChange ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            Rueckgaengig
          </button>
          <button
            onClick={() => setActiveEditorPanel('none')}
            style={{
              background: 'rgba(148, 163, 184, 0.35)',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              padding: '4px 10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            Schließen
          </button>
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, opacity: 0.9, marginBottom: 10 }}>
        <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
        Alle anzeigen (statt nur Umgebung)
      </label>

      {triggers.length === 0 && (
        <div style={{ opacity: 0.5, fontSize: 12 }}>Noch keine Trigger vorhanden.</div>
      )}

      {triggers.length > 0 && visibleTriggers.length === 0 && (
        <div style={{ opacity: 0.5, fontSize: 12 }}>
          Keine Trigger in der Nähe. "Alle anzeigen" aktivieren, um alle zu sehen.
        </div>
      )}

      {visibleTriggers.map((t) => (
        <div
          key={t.id}
          onClick={() => selectTrigger(t.id)}
          style={{
            background: selectedId === t.id ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)',
            borderRadius: 8,
            padding: 8,
            marginBottom: 6,
            cursor: 'pointer',
            border: selectedId === t.id ? '1px solid #6366f1' : '1px solid transparent',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, opacity: 0.6 }}>
              Pos: ({t.position[0].toFixed(1)}, {t.position[1].toFixed(1)}) |{' '}
              {t.shape === 'cylinder' ? `Zylinder r=${t.radius.toFixed(1)}` : `Box ${t.size[0].toFixed(1)} x ${t.size[1].toFixed(1)}`}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeTrigger(t.id)
              }}
              style={{
                background: '#cc2222',
                border: 'none',
                borderRadius: 4,
                color: '#fff',
                padding: '2px 8px',
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              Löschen
            </button>
          </div>
          {(t.onEnterActionId || t.onExitActionId) && (
            <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>
              {t.onEnterActionId && <div>Betreten → {actionLabel(t.onEnterActionId)}</div>}
              {t.onExitActionId && <div>Verlassen → {actionLabel(t.onExitActionId)}</div>}
            </div>
          )}
        </div>
      ))}

      {selected && (
        <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12 }}>
          <strong style={{ fontSize: 12 }}>Ausgewählt</strong>
          <label style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
            Grundform
            <select
              value={selected.shape}
              onChange={(e) => updateTrigger(selected.id, { shape: e.target.value as TriggerZone['shape'] })}
              style={{ ...inputStyle, ...selectStyle }}
            >
              <option value="box" style={optionStyle}>
                Quader
              </option>
              <option value="cylinder" style={optionStyle}>
                Zylinder
              </option>
            </select>
          </label>
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <label style={{ fontSize: 11 }}>
              X
              <input
                type="number"
                step={0.5}
                value={selected.position[0]}
                onFocus={() => setTriggerUndoSnapshot(selected.id)}
                onChange={(e) =>
                  updateTrigger(
                    selected.id,
                    { position: [parseFloat(e.target.value) || 0, selected.position[1]] },
                    { recordUndo: false },
                  )
                }
                style={inputStyle}
              />
            </label>
            <label style={{ fontSize: 11 }}>
              Z
              <input
                type="number"
                step={0.5}
                value={selected.position[1]}
                onFocus={() => setTriggerUndoSnapshot(selected.id)}
                onChange={(e) =>
                  updateTrigger(
                    selected.id,
                    { position: [selected.position[0], parseFloat(e.target.value) || 0] },
                    { recordUndo: false },
                  )
                }
                style={inputStyle}
              />
            </label>
            {selected.shape === 'cylinder' ? (
              <label style={{ fontSize: 11, gridColumn: '1 / -1' }}>
                Radius
                <input
                  type="number"
                  step={0.5}
                  min={0.5}
                  value={selected.radius}
                  onFocus={() => setTriggerUndoSnapshot(selected.id)}
                  onChange={(e) =>
                    updateTrigger(
                      selected.id,
                      { radius: Math.max(0.5, parseFloat(e.target.value) || 0.5) },
                      { recordUndo: false },
                    )
                  }
                  style={inputStyle}
                />
              </label>
            ) : (
              <>
                <label style={{ fontSize: 11 }}>
                  Breite
                  <input
                    type="number"
                    step={0.5}
                    min={1}
                    value={selected.size[0]}
                    onFocus={() => setTriggerUndoSnapshot(selected.id)}
                    onChange={(e) =>
                      updateTrigger(
                        selected.id,
                        { size: [Math.max(1, parseFloat(e.target.value) || 1), selected.size[1]] },
                        { recordUndo: false },
                      )
                    }
                    style={inputStyle}
                  />
                </label>
                <label style={{ fontSize: 11 }}>
                  Tiefe
                  <input
                    type="number"
                    step={0.5}
                    min={1}
                    value={selected.size[1]}
                    onFocus={() => setTriggerUndoSnapshot(selected.id)}
                    onChange={(e) =>
                      updateTrigger(
                        selected.id,
                        { size: [selected.size[0], Math.max(1, parseFloat(e.target.value) || 1)] },
                        { recordUndo: false },
                      )
                    }
                    style={inputStyle}
                  />
                </label>
                <label style={{ fontSize: 11, gridColumn: '1 / -1' }}>
                  Rotation (Grad)
                  <input
                    type="number"
                    step={5}
                    value={Math.round((selected.rotationY * 180) / Math.PI)}
                    onFocus={() => setTriggerUndoSnapshot(selected.id)}
                    onChange={(e) =>
                      updateTrigger(
                        selected.id,
                        { rotationY: ((parseFloat(e.target.value) || 0) * Math.PI) / 180 },
                        { recordUndo: false },
                      )
                    }
                    style={inputStyle}
                  />
                </label>
              </>
            )}
          </div>

          <div style={{ marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10 }}>
            <label style={{ fontSize: 11, display: 'block' }}>
              Beim Betreten
              <select
                value={selected.onEnterActionId ?? NONE_ACTION}
                onFocus={() => setTriggerUndoSnapshot(selected.id)}
                onChange={(e) =>
                  updateTrigger(selected.id, {
                    onEnterActionId: e.target.value === NONE_ACTION ? null : e.target.value,
                  })
                }
                style={{ ...inputStyle, ...selectStyle }}
              >
                <option value={NONE_ACTION} style={optionStyle}>
                  — Keine —
                </option>
                {actionOptions.map((a) => (
                  <option key={a.id} value={a.id} style={optionStyle}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
              Beim Verlassen
              <select
                value={selected.onExitActionId ?? NONE_ACTION}
                onFocus={() => setTriggerUndoSnapshot(selected.id)}
                onChange={(e) =>
                  updateTrigger(selected.id, {
                    onExitActionId: e.target.value === NONE_ACTION ? null : e.target.value,
                  })
                }
                style={{ ...inputStyle, ...selectStyle }}
              >
                <option value={NONE_ACTION} style={optionStyle}>
                  — Keine —
                </option>
                {actionOptions.map((a) => (
                  <option key={a.id} value={a.id} style={optionStyle}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>

            {actionOptions.length === 0 && (
              <div style={{ fontSize: 10, opacity: 0.6, marginTop: 6 }}>
                Keine Aktionen registriert – eine Szenen-Komponente muss zuerst per
                useTriggerAction() eine Funktion anmelden.
              </div>
            )}

            <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <label style={{ fontSize: 11 }}>
                Cooldown (s)
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  value={selected.cooldownSec}
                  onFocus={() => setTriggerUndoSnapshot(selected.id)}
                  onChange={(e) =>
                    updateTrigger(
                      selected.id,
                      { cooldownSec: Math.max(0, parseFloat(e.target.value) || 0) },
                      { recordUndo: false },
                    )
                  }
                  style={inputStyle}
                />
              </label>
              <label style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, marginTop: 16 }}>
                <input
                  type="checkbox"
                  checked={selected.once}
                  onChange={(e) => updateTrigger(selected.id, { once: e.target.checked })}
                />
                Nur einmal pro Sitzung
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 2,
  padding: '4px 6px',
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 4,
  color: '#fff',
  fontSize: 12,
}

// Native <option> elements ignore the parent's translucent background in most browsers and
// fall back to an OS-level white dropdown list, which paired with white text was unreadable.
const selectStyle: React.CSSProperties = {
  background: '#1e1e1e',
}

const optionStyle: React.CSSProperties = {
  background: '#1e1e1e',
  color: '#fff',
}
