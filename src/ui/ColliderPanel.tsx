import { useGardenStore } from '../store/gardenStore'
import { createCollider } from '../data/collider'
import { characterPosition } from '../character/characterPosition'

export function ColliderPanel() {
  const editorMode = useGardenStore((s) => s.editorMode)
  const colliders = useGardenStore((s) => s.colliders)
  const selectedId = useGardenStore((s) => s.selectedColliderId)
  const addCollider = useGardenStore((s) => s.addCollider)
  const removeCollider = useGardenStore((s) => s.removeCollider)
  const updateCollider = useGardenStore((s) => s.updateCollider)
  const selectCollider = useGardenStore((s) => s.selectCollider)

  if (!editorMode) return null

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
              Pos: ({c.position[0].toFixed(1)}, {c.position[1].toFixed(1)}) | {c.size[0].toFixed(1)} x {c.size[1].toFixed(1)}
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
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <label style={{ fontSize: 11 }}>
              X
              <input
                type="number"
                step={0.5}
                value={selected.position[0]}
                onChange={(e) =>
                  updateCollider(selected.id, { position: [parseFloat(e.target.value) || 0, selected.position[1]] })
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
                onChange={(e) =>
                  updateCollider(selected.id, { position: [selected.position[0], parseFloat(e.target.value) || 0] })
                }
                style={inputStyle}
              />
            </label>
            <label style={{ fontSize: 11 }}>
              Breite
              <input
                type="number"
                step={0.5}
                min={1}
                value={selected.size[0]}
                onChange={(e) =>
                  updateCollider(selected.id, { size: [Math.max(1, parseFloat(e.target.value) || 1), selected.size[1]] })
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
                onChange={(e) =>
                  updateCollider(selected.id, { size: [selected.size[0], Math.max(1, parseFloat(e.target.value) || 1)] })
                }
                style={inputStyle}
              />
            </label>
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
