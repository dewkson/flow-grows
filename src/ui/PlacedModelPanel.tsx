import { useState } from 'react'
import { useGardenStore } from '../store/gardenStore'
import { createPlacedModel } from '../data/placedModel'
import { MODEL_CATALOG } from '../data/modelCatalog'
import { characterPosition } from '../character/characterPosition'

export function PlacedModelPanel() {
  const editorMode = useGardenStore((s) => s.editorMode)
  const activeEditorPanel = useGardenStore((s) => s.activeEditorPanel)
  const setActiveEditorPanel = useGardenStore((s) => s.setActiveEditorPanel)
  const placedModels = useGardenStore((s) => s.placedModels)
  const selectedId = useGardenStore((s) => s.selectedPlacedModelId)
  const addPlacedModel = useGardenStore((s) => s.addPlacedModel)
  const removePlacedModel = useGardenStore((s) => s.removePlacedModel)
  const updatePlacedModel = useGardenStore((s) => s.updatePlacedModel)
  const selectPlacedModel = useGardenStore((s) => s.selectPlacedModel)

  const [selectedModelPath, setSelectedModelPath] = useState(MODEL_CATALOG[0].path)
  const [selectedScale, setSelectedScale] = useState(1)
  const [selectedPositionY, setSelectedPositionY] = useState(0)

  if (!editorMode || activeEditorPanel !== 'models') return null

  const selected = placedModels.find((m) => m.id === selectedId)

  const handlePlace = () => {
    const x = Math.round(characterPosition.x * 10) / 10
    const z = Math.round(characterPosition.z * 10) / 10
    const model = createPlacedModel(selectedModelPath, x, z, 0, selectedScale, selectedPositionY)
    addPlacedModel(model)
    selectPlacedModel(model.id)
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <strong style={{ fontSize: 14 }}>Modelle ({placedModels.length})</strong>
        <button onClick={() => setActiveEditorPanel('none')} style={closeButtonStyle}>
          Schließen
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <select
          value={selectedModelPath}
          onChange={(e) => setSelectedModelPath(e.target.value)}
          style={{ ...inputStyle, ...selectStyle, marginTop: 0, flex: 1 }}
        >
          {MODEL_CATALOG.map((entry) => (
            <option key={entry.path} value={entry.path} style={optionStyle}>
              {entry.label}
            </option>
          ))}
        </select>
        <button onClick={handlePlace} style={addButtonStyle}>
          + Platzieren
        </button>
      </div>

      <label style={{ fontSize: 11, display: 'block', marginBottom: 12 }}>
        Scale
        <input
          type="number"
          step={0.1}
          min={0.01}
          value={selectedScale}
          onChange={(e) => setSelectedScale(parseFloat(e.target.value) || 1)}
          style={inputStyle}
        />
      </label>

      <label style={{ fontSize: 11, display: 'block', marginBottom: 12 }}>
        Höhe (Y)
        <input
          type="number"
          step={0.1}
          value={selectedPositionY}
          onChange={(e) => setSelectedPositionY(parseFloat(e.target.value) || 0)}
          style={inputStyle}
        />
      </label>

      {placedModels.length === 0 && (
        <div style={{ opacity: 0.5, fontSize: 12 }}>Noch keine Modelle platziert.</div>
      )}

      {placedModels.map((m) => {
        const catalogEntry = MODEL_CATALOG.find((c) => c.path === m.modelPath)
        return (
          <div
            key={m.id}
            onClick={() => selectPlacedModel(m.id)}
            style={{
              background: selectedId === m.id ? 'rgba(255, 136, 0, 0.3)' : 'rgba(255,255,255,0.05)',
              borderRadius: 8,
              padding: 8,
              marginBottom: 6,
              cursor: 'pointer',
              border: selectedId === m.id ? '1px solid #ff8800' : '1px solid transparent',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, opacity: 0.8 }}>
                {catalogEntry?.label ?? m.modelPath} | ({m.position[0].toFixed(1)}, {m.position[1].toFixed(1)})
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removePlacedModel(m.id)
                }}
                style={deleteButtonStyle}
              >
                Löschen
              </button>
            </div>
          </div>
        )
      })}

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
                  updatePlacedModel(selected.id, {
                    position: [parseFloat(e.target.value) || 0, selected.position[1]],
                  })
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
                  updatePlacedModel(selected.id, {
                    position: [selected.position[0], parseFloat(e.target.value) || 0],
                  })
                }
                style={inputStyle}
              />
            </label>
            <label style={{ fontSize: 11, gridColumn: '1 / -1' }}>
              Höhe (Y)
              <input
                type="number"
                step={0.1}
                value={selected.positionY}
                onChange={(e) =>
                  updatePlacedModel(selected.id, {
                    positionY: parseFloat(e.target.value) || 0,
                  })
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
                onChange={(e) =>
                  updatePlacedModel(selected.id, {
                    rotationY: ((parseFloat(e.target.value) || 0) * Math.PI) / 180,
                  })
                }
                style={inputStyle}
              />
            </label>
            <label style={{ fontSize: 11, gridColumn: '1 / -1' }}>
              Scale
              <input
                type="number"
                step={0.1}
                min={0.01}
                value={selected.scale}
                onChange={(e) =>
                  updatePlacedModel(selected.id, {
                    scale: parseFloat(e.target.value) || 1,
                  })
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

const addButtonStyle: React.CSSProperties = {
  background: '#ff8800',
  border: 'none',
  borderRadius: 6,
  color: '#fff',
  padding: '4px 12px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 12,
  whiteSpace: 'nowrap',
}

const closeButtonStyle: React.CSSProperties = {
  background: 'rgba(148, 163, 184, 0.35)',
  border: 'none',
  borderRadius: 6,
  color: '#fff',
  padding: '4px 10px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 12,
}

const deleteButtonStyle: React.CSSProperties = {
  background: '#cc2222',
  border: 'none',
  borderRadius: 4,
  color: '#fff',
  padding: '2px 8px',
  cursor: 'pointer',
  fontSize: 11,
}

// Native <option> elements ignore the parent's translucent background in most browsers and
// fall back to an OS-level white dropdown list; pairing that with white text (inputStyle.color)
// made entries unreadable. Force explicit solid colors on the select and its options instead.
const selectStyle: React.CSSProperties = {
  background: '#1e1e1e',
}

const optionStyle: React.CSSProperties = {
  background: '#1e1e1e',
  color: '#fff',
}
