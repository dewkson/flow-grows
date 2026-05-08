import { useGardenStore } from '../store/gardenStore'

export function EditorMenu() {
  const editorMode = useGardenStore((s) => s.editorMode)
  const activeEditorPanel = useGardenStore((s) => s.activeEditorPanel)
  const setActiveEditorPanel = useGardenStore((s) => s.setActiveEditorPanel)

  if (!editorMode) return null

  const togglePanel = (panel: 'colliders' | 'clickzones' | 'hints') => {
    setActiveEditorPanel(activeEditorPanel === panel ? 'none' : panel)
  }

  return (
    <div
      data-no-camera-drag="true"
      style={{
        position: 'fixed',
        top: 62,
        left: 16,
        zIndex: 1000,
        display: 'flex',
        gap: 8,
      }}
    >
      <button
        onClick={() => togglePanel('colliders')}
        style={{
          ...buttonStyle,
          background: activeEditorPanel === 'colliders' ? 'rgba(245, 158, 11, 0.95)' : 'rgba(51, 65, 85, 0.92)',
        }}
        title="Collider-Editor öffnen"
      >
        Collider
      </button>

      <button
        onClick={() => togglePanel('clickzones')}
        style={{
          ...buttonStyle,
          background: activeEditorPanel === 'clickzones' ? 'rgba(14, 116, 144, 0.95)' : 'rgba(51, 65, 85, 0.92)',
        }}
        title="Klickzonen-Editor öffnen"
      >
        Hotspots
      </button>

      <button
        onClick={() => togglePanel('hints')}
        style={{
          ...buttonStyle,
          background: activeEditorPanel === 'hints' ? 'rgba(99, 102, 241, 0.95)' : 'rgba(51, 65, 85, 0.92)',
        }}
        title="Hints bearbeiten"
      >
        Hints
      </button>
    </div>
  )
}

const buttonStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 9,
  padding: '7px 12px',
  color: '#fff',
  cursor: 'pointer',
  fontFamily: 'system-ui, sans-serif',
  fontSize: 12,
  fontWeight: 700,
  backdropFilter: 'blur(8px)',
}
