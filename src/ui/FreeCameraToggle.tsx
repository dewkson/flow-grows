import { useGardenStore } from '../store/gardenStore'

export function FreeCameraToggle() {
  const editorMode = useGardenStore((s) => s.editorMode)
  const freeCameraMode = useGardenStore((s) => s.freeCameraMode)
  const toggle = useGardenStore((s) => s.toggleFreeCameraMode)

  if (!editorMode) return null

  return (
    <button
      onClick={toggle}
      data-no-camera-drag="true"
      title={freeCameraMode ? 'Freie Kamera verlassen' : 'Freie Kamera (Charakter bleibt stehen)'}
      style={{
        position: 'fixed',
        top: '16px',
        right: '140px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: 600,
        fontFamily: 'system-ui, sans-serif',
        color: '#fff',
        background: freeCameraMode ? 'rgba(217, 70, 239, 0.9)' : 'rgba(51, 65, 85, 0.92)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '10px',
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        transition: 'background 0.2s, transform 0.1s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
      Freie Kamera
    </button>
  )
}
