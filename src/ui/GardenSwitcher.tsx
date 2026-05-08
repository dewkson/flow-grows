import { useState } from 'react'
import { useGardenStore, type GardenSnapshot, type SpriteConfig } from '../store/gardenStore'

/** Sprite configs for the old garden (multi-sprite layout). */
const OLD_GARDEN_SPRITES: SpriteConfig[] = [
  { url: '/sprites/origin-tree-transparent.png', position: [0, 0, 0], scale: 30 },
  {
    url: '/sprites/origin-tree-solo.png',
    position: [0, 0, 0],
    scale: 30,
    renderOrder: 3,
    depthTest: false,
    receiveShadow: false,
  },
  { url: '/sprites/music-production-area-transparent.png', position: [-52, 0, -52], scale: 20 },
  { url: '/sprites/path-isles.png', position: [-20, 0, 0], scale: 20 },
  { url: '/sprites/game-dev-area.png', position: [30, 0, -30], scale: 30 },
]

export function GardenSwitcher() {
  const editorMode = useGardenStore((s) => s.editorMode)
  const gardens = useGardenStore((s) => s.gardens)
  const activeGardenId = useGardenStore((s) => s.activeGardenId)
  const saveCurrentAsGarden = useGardenStore((s) => s.saveCurrentAsGarden)
    const overwriteCurrentGarden = useGardenStore((s) => s.overwriteCurrentGarden)
  const loadGarden = useGardenStore((s) => s.loadGarden)
  const deleteGarden = useGardenStore((s) => s.deleteGarden)
  const renameGarden = useGardenStore((s) => s.renameGarden)

  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const activeGarden = gardens.find((g) => g.id === activeGardenId) ?? null

  if (!editorMode) return null

  const handleSave = () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    saveCurrentAsGarden(trimmed)
    setNewName('')
  }

  const handleRenameCommit = (id: string) => {
    const trimmed = editingName.trim()
    if (trimmed) renameGarden(id, trimmed)
    setEditingId(null)
    setEditingName('')
  }

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    })

  return (
    <div
      data-no-camera-drag="true"
      style={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={toggleBtnStyle}
        title="Gärten verwalten"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        {open ? 'Schließen' : 'Gärten'}
        {gardens.length > 0 && (
          <span style={badgeStyle}>{gardens.length}</span>
        )}
      </button>

      {open && (
        <div style={panelStyle}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: '#e2e8f0' }}>
            Gespeicherte Gärten
          </div>

          {/* Save current state */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="Name für neuen Garten…"
                style={inputStyle}
              />
              <button onClick={handleSave} style={actionBtnStyle('#16a34a')} title="Als neuen Garten speichern">
                + Neu
              </button>
            </div>
            {activeGarden && (
              <button
                onClick={() => overwriteCurrentGarden()}
                style={{ ...actionBtnStyle('#d97706'), width: '100%', textAlign: 'left', padding: '5px 10px' }}
                title={`Garten "${activeGarden.name}" mit aktuellem Stand überschreiben`}
              >
                ↺ Aktiven Garten überschreiben: „{activeGarden.name}"
              </button>
            )}
          </div>

          {/* Quick-save old garden preset if no gardens exist yet */}
          {gardens.length === 0 && (
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>
              Tipp: Speichere deinen aktuellen Stand, bevor du wechselst.
            </div>
          )}

          {/* List of gardens */}
          {gardens.length === 0 ? (
            <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center', padding: '8px 0' }}>
              Noch keine Gärten gespeichert.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {gardens.map((g: GardenSnapshot) => (
                <li
                  key={g.id}
                  style={{
                    background: g.id === activeGardenId ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${g.id === activeGardenId ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 8,
                    padding: '7px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  {editingId === g.id ? (
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleRenameCommit(g.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameCommit(g.id)
                        if (e.key === 'Escape') { setEditingId(null); setEditingName('') }
                      }}
                      style={{ ...inputStyle, marginBottom: 0 }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <span
                        style={{ fontWeight: 600, fontSize: 12, color: '#e2e8f0', cursor: 'text', flex: 1 }}
                        onDoubleClick={() => { setEditingId(g.id); setEditingName(g.name) }}
                        title="Doppelklick zum Umbenennen"
                      >
                        {g.name}
                        {g.id === activeGardenId && (
                          <span style={{ marginLeft: 6, fontSize: 10, color: '#818cf8', fontWeight: 400 }}>aktiv</span>
                        )}
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => loadGarden(g.id)}
                          disabled={g.id === activeGardenId}
                          style={actionBtnStyle('#0e7490', g.id === activeGardenId)}
                          title="Diesen Garten laden"
                        >
                          Laden
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Garten "${g.name}" wirklich löschen?`)) deleteGarden(g.id)
                          }}
                          style={actionBtnStyle('#dc2626')}
                          title="Garten löschen"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: '#64748b' }}>
                    Gespeichert: {formatDate(g.updatedAt)} · {g.colliders.length} Collider · {g.linkedClickZones.length} Zonen
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Preset: old garden sprites */}
          <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>Sprite-Vorlagen</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                onClick={() => useGardenStore.getState().setSpriteSetup(OLD_GARDEN_SPRITES)}
                style={actionBtnStyle('#7c3aed')}
                title="Altes Multi-Sprite-Layout aktivieren"
              >
                Alter Garten (Sprites)
              </button>
              <button
                onClick={() => useGardenStore.getState().setSpriteSetup([{ url: '/sprites/whole.png', position: [0, 0, 0], scale: 50 }])}
                style={actionBtnStyle('#0e7490')}
                title="Neues Einzel-Sprite aktivieren"
              >
                Neuer Garten (whole.png)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const toggleBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '7px 14px',
  background: 'rgba(51, 65, 85, 0.92)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 10,
  color: '#fff',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 700,
  fontFamily: 'system-ui, sans-serif',
  backdropFilter: 'blur(8px)',
  position: 'relative',
}

const badgeStyle: React.CSSProperties = {
  background: 'rgba(99, 102, 241, 0.85)',
  borderRadius: '50%',
  width: 18,
  height: 18,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10,
  fontWeight: 700,
}

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 44,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 320,
  background: 'rgba(15, 23, 42, 0.97)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  padding: 14,
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  backdropFilter: 'blur(12px)',
  fontFamily: 'system-ui, sans-serif',
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 7,
  padding: '5px 8px',
  color: '#e2e8f0',
  fontSize: 12,
  fontFamily: 'system-ui, sans-serif',
  outline: 'none',
}

function actionBtnStyle(bg: string, disabled = false): React.CSSProperties {
  return {
    background: disabled ? 'rgba(100,116,139,0.4)' : bg,
    border: 'none',
    borderRadius: 6,
    padding: '5px 10px',
    color: '#fff',
    cursor: disabled ? 'default' : 'pointer',
    fontSize: 11,
    fontWeight: 600,
    fontFamily: 'system-ui, sans-serif',
    opacity: disabled ? 0.5 : 1,
    whiteSpace: 'nowrap',
  }
}
