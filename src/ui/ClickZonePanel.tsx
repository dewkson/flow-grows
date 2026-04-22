import { useMemo } from 'react'
import type { ClickZone } from '../data/contentArea'
import { useGardenStore } from '../store/gardenStore'

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function parseNumber(value: string, fallback: number): number {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function buildDefaultClickZone(zone: ClickZone): ClickZone {
  return {
    space: zone.space ?? 'world',
    shape: zone.shape,
    offset: zone.offset ?? [0, -0.06, 0],
    size: zone.size ?? [10, 10],
    radius: zone.radius ?? 6,
    screenOffset: zone.screenOffset ?? [0, 0],
    screenSize: zone.screenSize ?? [120, 120],
    screenRadius: zone.screenRadius ?? 60,
  }
}

export function ClickZonePanel() {
  const editorMode = useGardenStore((s) => s.editorMode)
  const activeEditorPanel = useGardenStore((s) => s.activeEditorPanel)
  const setActiveEditorPanel = useGardenStore((s) => s.setActiveEditorPanel)
  const showHotspotZones = useGardenStore((s) => s.showHotspotZones)
  const toggleHotspotZones = useGardenStore((s) => s.toggleHotspotZones)
  const contentAreas = useGardenStore((s) => s.contentAreas)
  const linkedClickZones = useGardenStore((s) => s.linkedClickZones)
  const addLinkedClickZone = useGardenStore((s) => s.addLinkedClickZone)
  const removeLinkedClickZone = useGardenStore((s) => s.removeLinkedClickZone)
  const updateLinkedClickZone = useGardenStore((s) => s.updateLinkedClickZone)
  const updateLinkedClickZoneShape = useGardenStore((s) => s.updateLinkedClickZoneShape)
  const openEmbedPanel = useGardenStore((s) => s.openEmbedPanel)
  const setActiveContent = useGardenStore((s) => s.setActiveContent)

  const linkableAreas = useMemo(() => contentAreas, [contentAreas])

  if (!editorMode || activeEditorPanel !== 'clickzones') return null

  return (
    <div
      data-no-camera-drag="true"
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
        background: 'rgba(30, 30, 30, 0.92)',
        backdropFilter: 'blur(8px)',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 12,
        minWidth: 280,
        maxWidth: 360,
        maxHeight: '56vh',
        overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <strong style={{ fontSize: 14 }}>Content-Hotspots ({linkedClickZones.length})</strong>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => {
              if (linkableAreas.length === 0) return
              addLinkedClickZone({
                linkedContentId: linkableAreas[0].id,
                clickZone: {
                  space: 'world',
                  shape: 'rect',
                  offset: [0, -0.06, 0],
                  size: [10, 10],
                  screenOffset: [0, 0],
                  screenSize: [120, 120],
                },
              })
            }}
            style={{
              background: '#16a34a',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              padding: '4px 10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            + Hotspot
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, opacity: 0.9 }}>
          <input
            type="checkbox"
            checked={showHotspotZones}
            onChange={(e) => {
              if (e.target.checked !== showHotspotZones) toggleHotspotZones()
            }}
          />
          Hotspots anzeigen
        </label>
      </div>

      {linkableAreas.length === 0 && (
        <div style={{ opacity: 0.6 }}>Keine Content-Bereiche gefunden.</div>
      )}

      {linkedClickZones.length === 0 && linkableAreas.length > 0 && (
        <div style={{ opacity: 0.6 }}>Noch keine Content-Hotspots angelegt.</div>
      )}

      {linkedClickZones.map((zoneEntry) => {
        const zone = buildDefaultClickZone(zoneEntry.clickZone)
        const offset = zone.offset ?? [0, -0.06, 0]
        const size = zone.size ?? [8, 8]
        const radius = zone.radius ?? 6
        const space = zone.space ?? 'world'
        const screenOffset = zone.screenOffset ?? [0, 0]
        const screenSize = zone.screenSize ?? [120, 120]
        const screenRadius = zone.screenRadius ?? 60

        const setZone = (patch: Partial<ClickZone>) => {
          updateLinkedClickZoneShape(zoneEntry.id, patch)
        }

        const linkedArea = linkableAreas.find((area) => area.id === zoneEntry.linkedContentId)

        return (
          <div
            key={zoneEntry.id}
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 10,
              padding: 10,
              marginBottom: 8,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <input
                type="text"
                value={zoneEntry.name}
                onChange={(e) => updateLinkedClickZone(zoneEntry.id, { name: e.target.value })}
                style={{ ...inputStyle, flex: 1, marginTop: 0 }}
              />
              <button
                onClick={() => removeLinkedClickZone(zoneEntry.id)}
                style={{
                  background: '#dc2626',
                  border: 'none',
                  borderRadius: 6,
                  color: '#fff',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: 11,
                }}
              >
                Löschen
              </button>
            </div>

            <label style={labelStyle}>
              Verknüpfter Content
              <select
                value={zoneEntry.linkedContentId}
                onChange={(e) => updateLinkedClickZone(zoneEntry.id, { linkedContentId: e.target.value })}
                style={inputStyle}
              >
                {linkableAreas.map((area) => (
                  <option key={area.id} value={area.id}>{area.title}</option>
                ))}
              </select>
            </label>

            {linkedArea && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 11, opacity: 0.75 }}>
                  Ziel: {linkedArea.title}
                </div>
                <button
                  onClick={() => {
                    if (linkedArea.contentType === 'embed' || linkedArea.contentType === 'game') {
                      openEmbedPanel(linkedArea.id)
                      return
                    }
                    setActiveContent(linkedArea.id)
                  }}
                  style={{
                    background: '#4f46e5',
                    border: 'none',
                    borderRadius: 6,
                    color: '#fff',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                >
                  Ziel öffnen
                </button>
              </div>
            )}

            <label style={labelStyle}>
              Platzierung
              <select
                value={space}
                onChange={(e) => {
                  const next = e.target.value as 'world' | 'screen'
                  setZone({
                    space: next,
                    shape: zone.shape,
                    offset: offset,
                    size: size,
                    radius,
                    screenOffset,
                    screenSize,
                    screenRadius,
                  })
                }}
                style={inputStyle}
              >
                <option value="world">World Space</option>
                <option value="screen">Screen Space</option>
              </select>
            </label>

            <label style={labelStyle}>
              Form
              <select
                value={zone.shape}
                onChange={(e) => {
                  const next = e.target.value as ClickZone['shape']
                  if (next === 'circle') {
                    setZone({ shape: 'circle', radius: round2(Math.max(1, radius)), size })
                    return
                  }
                  setZone({ shape: 'rect', size: [round2(Math.max(1, size[0])), round2(Math.max(1, size[1]))], radius })
                }}
                style={inputStyle}
              >
                <option value="rect">Rechteck</option>
                <option value="circle">Kreis</option>
              </select>
            </label>

            {space === 'world' ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <label style={labelStyle}>
                    Offset X
                    <input
                      type="number"
                      step={0.25}
                      value={offset[0]}
                      onChange={(e) => {
                        setZone({ offset: [round2(parseNumber(e.target.value, offset[0])), offset[1], offset[2]] })
                      }}
                      style={inputStyle}
                    />
                  </label>
                  <label style={labelStyle}>
                    Offset Z
                    <input
                      type="number"
                      step={0.25}
                      value={offset[2]}
                      onChange={(e) => {
                        setZone({ offset: [offset[0], offset[1], round2(parseNumber(e.target.value, offset[2]))] })
                      }}
                      style={inputStyle}
                    />
                  </label>
                </div>

                {zone.shape === 'circle' ? (
                  <label style={labelStyle}>
                    Radius
                    <input
                      type="number"
                      min={1}
                      step={0.25}
                      value={radius}
                      onChange={(e) => {
                        setZone({ radius: round2(Math.max(1, parseNumber(e.target.value, radius))) })
                      }}
                      style={inputStyle}
                    />
                  </label>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <label style={labelStyle}>
                      Breite
                      <input
                        type="number"
                        min={1}
                        step={0.25}
                        value={size[0]}
                        onChange={(e) => {
                          setZone({ size: [round2(Math.max(1, parseNumber(e.target.value, size[0]))), size[1]] })
                        }}
                        style={inputStyle}
                      />
                    </label>
                    <label style={labelStyle}>
                      Tiefe
                      <input
                        type="number"
                        min={1}
                        step={0.25}
                        value={size[1]}
                        onChange={(e) => {
                          setZone({ size: [size[0], round2(Math.max(1, parseNumber(e.target.value, size[1])))] })
                        }}
                        style={inputStyle}
                      />
                    </label>
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <label style={labelStyle}>
                    Offset X (px)
                    <input
                      type="number"
                      step={1}
                      value={screenOffset[0]}
                      onChange={(e) => {
                        setZone({ screenOffset: [round2(parseNumber(e.target.value, screenOffset[0])), screenOffset[1]] })
                      }}
                      style={inputStyle}
                    />
                  </label>
                  <label style={labelStyle}>
                    Offset Y (px)
                    <input
                      type="number"
                      step={1}
                      value={screenOffset[1]}
                      onChange={(e) => {
                        setZone({ screenOffset: [screenOffset[0], round2(parseNumber(e.target.value, screenOffset[1]))] })
                      }}
                      style={inputStyle}
                    />
                  </label>
                </div>

                {zone.shape === 'circle' ? (
                  <label style={labelStyle}>
                    Radius (px)
                    <input
                      type="number"
                      min={12}
                      step={1}
                      value={screenRadius}
                      onChange={(e) => {
                        setZone({ screenRadius: round2(Math.max(12, parseNumber(e.target.value, screenRadius))) })
                      }}
                      style={inputStyle}
                    />
                  </label>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <label style={labelStyle}>
                      Breite (px)
                      <input
                        type="number"
                        min={20}
                        step={1}
                        value={screenSize[0]}
                        onChange={(e) => {
                          setZone({ screenSize: [round2(Math.max(20, parseNumber(e.target.value, screenSize[0]))), screenSize[1]] })
                        }}
                        style={inputStyle}
                      />
                    </label>
                    <label style={labelStyle}>
                      Höhe (px)
                      <input
                        type="number"
                        min={20}
                        step={1}
                        value={screenSize[1]}
                        onChange={(e) => {
                          setZone({ screenSize: [screenSize[0], round2(Math.max(20, parseNumber(e.target.value, screenSize[1])))] })
                        }}
                        style={inputStyle}
                      />
                    </label>
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: 11,
  marginBottom: 6,
}

const inputStyle = {
  width: '100%',
  marginTop: 2,
  padding: '4px 6px',
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 4,
  color: '#fff',
  fontSize: 12,
  boxSizing: 'border-box' as const,
}
