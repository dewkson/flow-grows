import { useState } from 'react'
import { useGardenStore } from '../store/gardenStore'
import { usePolledCharacterPosition } from '../character/characterPosition'
import { EDITOR_LIST_RADIUS } from '../world/constants'

function toNumber(value: string, fallback: number): number {
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : fallback
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export function ContentAreaPanel() {
  const editorMode = useGardenStore((s) => s.editorMode)
  const activeEditorPanel = useGardenStore((s) => s.activeEditorPanel)
  const setActiveEditorPanel = useGardenStore((s) => s.setActiveEditorPanel)
  const showHintZones = useGardenStore((s) => s.showHintZones)
  const toggleHintZones = useGardenStore((s) => s.toggleHintZones)
  const hintsEnabled = useGardenStore((s) => s.hintsEnabled)
  const toggleHintsEnabled = useGardenStore((s) => s.toggleHintsEnabled)
  const contentAreas = useGardenStore((s) => s.contentAreas)
  const updateContentText = useGardenStore((s) => s.updateContentText)
  const updateContentAreaMeta = useGardenStore((s) => s.updateContentAreaMeta)

  const [showAll, setShowAll] = useState(false)
  const isOpen = editorMode && activeEditorPanel === 'hints'
  const livePos = usePolledCharacterPosition(isOpen && !showAll)

  if (!isOpen) return null

  const visibleContentAreas = showAll
    ? contentAreas
    : contentAreas.filter((area) => {
        const dx = livePos.x - area.worldPosition[0]
        const dz = livePos.z - area.worldPosition[2]
        return dx * dx + dz * dz <= EDITOR_LIST_RADIUS * EDITOR_LIST_RADIUS
      })

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
        fontSize: 12,
        minWidth: 340,
        maxWidth: 420,
        maxHeight: '60vh',
        overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <strong style={{ fontSize: 14 }}>
          Hints ({showAll ? contentAreas.length : `${visibleContentAreas.length}/${contentAreas.length}`})
        </strong>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, opacity: 0.9 }}>
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
            />
            Alle anzeigen
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, opacity: 0.9 }}>
            <input
              type="checkbox"
              checked={hintsEnabled}
              onChange={(e) => {
                if (e.target.checked !== hintsEnabled) toggleHintsEnabled()
              }}
            />
            Hints aktiv
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, opacity: 0.9 }}>
            <input
              type="checkbox"
              checked={showHintZones}
              onChange={(e) => {
                if (e.target.checked !== showHintZones) toggleHintZones()
              }}
            />
            Hint-Radien anzeigen
          </label>
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

      {contentAreas.length > 0 && visibleContentAreas.length === 0 && (
        <div style={{ opacity: 0.6, marginBottom: 10 }}>
          Keine Hints in der Nähe. "Alle anzeigen" aktivieren, um alle zu sehen.
        </div>
      )}

      {visibleContentAreas.map((area) => {
        const worldPos = area.worldPosition
        const radius = area.interactionRadius ?? 6
        const panelConfig = area.panelConfig ?? {}
        const panelOffset = panelConfig.offset ?? [8, 0, 10]

        return (
          <div
            key={area.id}
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 10,
              padding: 10,
              marginBottom: 10,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{area.id}</div>

            <label style={labelStyle}>
              Titel
              <input
                type="text"
                value={area.title}
                onChange={(e) => updateContentAreaMeta(area.id, { title: e.target.value })}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Beschreibung
              <textarea
                value={area.description}
                onChange={(e) => updateContentText(area.id, e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' as const }}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              <label style={labelStyle}>
                Hint X
                <input
                  type="number"
                  step={0.25}
                  value={worldPos[0]}
                  onChange={(e) => {
                    updateContentAreaMeta(area.id, {
                      worldPosition: [round2(toNumber(e.target.value, worldPos[0])), worldPos[1], worldPos[2]],
                    })
                  }}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Hint Y
                <input
                  type="number"
                  step={0.25}
                  value={worldPos[1]}
                  onChange={(e) => {
                    updateContentAreaMeta(area.id, {
                      worldPosition: [worldPos[0], round2(toNumber(e.target.value, worldPos[1])), worldPos[2]],
                    })
                  }}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Hint Z
                <input
                  type="number"
                  step={0.25}
                  value={worldPos[2]}
                  onChange={(e) => {
                    updateContentAreaMeta(area.id, {
                      worldPosition: [worldPos[0], worldPos[1], round2(toNumber(e.target.value, worldPos[2]))],
                    })
                  }}
                  style={inputStyle}
                />
              </label>
            </div>

            <label style={labelStyle}>
              Hint Radius
              <input
                type="number"
                min={1}
                step={0.25}
                value={radius}
                onChange={(e) => {
                  updateContentAreaMeta(area.id, {
                    interactionRadius: Math.max(1, round2(toNumber(e.target.value, radius))),
                  })
                }}
                style={inputStyle}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              <label style={labelStyle}>
                Hint Panel X
                <input
                  type="number"
                  step={0.25}
                  value={panelOffset[0]}
                  onChange={(e) => {
                    updateContentAreaMeta(area.id, {
                      panelConfig: {
                        ...panelConfig,
                        offset: [round2(toNumber(e.target.value, panelOffset[0])), panelOffset[1], panelOffset[2]],
                      },
                    })
                  }}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Hint Panel Y
                <input
                  type="number"
                  step={0.25}
                  value={panelOffset[1]}
                  onChange={(e) => {
                    updateContentAreaMeta(area.id, {
                      panelConfig: {
                        ...panelConfig,
                        offset: [panelOffset[0], round2(toNumber(e.target.value, panelOffset[1])), panelOffset[2]],
                      },
                    })
                  }}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Hint Panel Z
                <input
                  type="number"
                  step={0.25}
                  value={panelOffset[2]}
                  onChange={(e) => {
                    updateContentAreaMeta(area.id, {
                      panelConfig: {
                        ...panelConfig,
                        offset: [panelOffset[0], panelOffset[1], round2(toNumber(e.target.value, panelOffset[2]))],
                      },
                    })
                  }}
                  style={inputStyle}
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              <label style={labelStyle}>
                Panel Farbe
                <input
                  type="color"
                  value={panelConfig.panelColor ?? '#1e293b'}
                  onChange={(e) => {
                    updateContentAreaMeta(area.id, {
                      panelConfig: {
                        ...panelConfig,
                        panelColor: e.target.value,
                      },
                    })
                  }}
                  style={colorInputStyle}
                />
              </label>
              <label style={labelStyle}>
                Titel Farbe
                <input
                  type="color"
                  value={panelConfig.titleColor ?? '#e2e8f0'}
                  onChange={(e) => {
                    updateContentAreaMeta(area.id, {
                      panelConfig: {
                        ...panelConfig,
                        titleColor: e.target.value,
                      },
                    })
                  }}
                  style={colorInputStyle}
                />
              </label>
              <label style={labelStyle}>
                Text Farbe
                <input
                  type="color"
                  value={panelConfig.textColor ?? '#f1f5f9'}
                  onChange={(e) => {
                    updateContentAreaMeta(area.id, {
                      panelConfig: {
                        ...panelConfig,
                        textColor: e.target.value,
                      },
                    })
                  }}
                  style={colorInputStyle}
                />
              </label>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 2,
  padding: '4px 6px',
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 4,
  color: '#fff',
  fontSize: 12,
  boxSizing: 'border-box',
}

const colorInputStyle: React.CSSProperties = {
  ...inputStyle,
  padding: 2,
  height: 30,
}
