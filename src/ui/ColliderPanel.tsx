import { useEffect } from 'react'
import { useGardenStore } from '../store/gardenStore'
import { createCollider } from '../data/collider'
import type { Collider } from '../data/collider'
import { characterPosition } from '../character/characterPosition'

export function ColliderPanel() {
  const editorMode = useGardenStore((s) => s.editorMode)
  const activeEditorPanel = useGardenStore((s) => s.activeEditorPanel)
  const setActiveEditorPanel = useGardenStore((s) => s.setActiveEditorPanel)
  const colliders = useGardenStore((s) => s.colliders)
  const selectedId = useGardenStore((s) => s.selectedColliderId)
  const addCollider = useGardenStore((s) => s.addCollider)
  const removeCollider = useGardenStore((s) => s.removeCollider)
  const updateCollider = useGardenStore((s) => s.updateCollider)
  const setColliderUndoSnapshot = useGardenStore((s) => s.setColliderUndoSnapshot)
  const undoLastColliderChange = useGardenStore((s) => s.undoLastColliderChange)
  const canUndoColliderChange = useGardenStore((s) => s.canUndoColliderChange)
  const selectCollider = useGardenStore((s) => s.selectCollider)

  useEffect(() => {
    if (!editorMode || activeEditorPanel !== 'colliders') return

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
      if (!useGardenStore.getState().canUndoColliderChange) return

      event.preventDefault()
      useGardenStore.getState().undoLastColliderChange()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editorMode, activeEditorPanel])

  if (!editorMode || activeEditorPanel !== 'colliders') return null

  const selected = colliders.find((c) => c.id === selectedId)

  const handleAdd = () => {
    const x = Math.round(characterPosition.x)
    const z = Math.round(characterPosition.z)
    const collider = createCollider(x, z, 4, 4)
    addCollider(collider)
    selectCollider(collider.id)
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
        minWidth: 220,
        maxHeight: '50vh',
        overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <strong style={{ fontSize: 14 }}>Colliders ({colliders.length})</strong>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={handleAdd}
            style={{
              background: '#ff8800',
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
            onClick={undoLastColliderChange}
            disabled={!canUndoColliderChange}
            title="Rückgängig (Ctrl/Cmd+Z)"
            style={{
              background: canUndoColliderChange ? 'rgba(59, 130, 246, 0.85)' : 'rgba(59, 130, 246, 0.3)',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              padding: '4px 10px',
              cursor: canUndoColliderChange ? 'pointer' : 'not-allowed',
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

      {colliders.length === 0 && (
        <div style={{ opacity: 0.5, fontSize: 12 }}>
          Noch keine Collider vorhanden.
        </div>
      )}

      {colliders.map((c) => (
        <div
          key={c.id}
          onClick={() => selectCollider(c.id)}
          style={{
            background: selectedId === c.id ? 'rgba(255, 136, 0, 0.3)' : 'rgba(255,255,255,0.05)',
            borderRadius: 8,
            padding: 8,
            marginBottom: 6,
            cursor: 'pointer',
            border: selectedId === c.id ? '1px solid #ff8800' : '1px solid transparent',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, opacity: 0.6 }}>
              Pos: ({c.position[0].toFixed(1)}, {c.position[1].toFixed(1)}) |{' '}
              {c.shape === 'cylinder' ? `Zylinder r=${c.radius.toFixed(1)}` : `Box ${c.size[0].toFixed(1)} x ${c.size[1].toFixed(1)}`} |{' '}
              {Math.round((c.rotationY * 180) / Math.PI)}°
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeCollider(c.id)
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
        </div>
      ))}

      {selected && (
        <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12 }}>
          <strong style={{ fontSize: 12 }}>Ausgewählt</strong>
          <label style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
            Grundform
            <select
              value={selected.shape}
              onChange={(e) => updateCollider(selected.id, { shape: e.target.value as Collider['shape'] })}
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
                onFocus={() => setColliderUndoSnapshot(selected.id)}
                onChange={(e) =>
                  updateCollider(
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
                onFocus={() => setColliderUndoSnapshot(selected.id)}
                onChange={(e) =>
                  updateCollider(
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
                  onFocus={() => setColliderUndoSnapshot(selected.id)}
                  onChange={(e) =>
                    updateCollider(
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
                    onFocus={() => setColliderUndoSnapshot(selected.id)}
                    onChange={(e) =>
                      updateCollider(
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
                    onFocus={() => setColliderUndoSnapshot(selected.id)}
                    onChange={(e) =>
                      updateCollider(
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
                    onFocus={() => setColliderUndoSnapshot(selected.id)}
                    onChange={(e) =>
                      updateCollider(
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
