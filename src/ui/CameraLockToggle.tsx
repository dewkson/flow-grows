import { useGardenStore } from '../store/gardenStore'

export function CameraLockToggle() {
  const editorMode = useGardenStore((s) => s.editorMode)
  const freeCameraMode = useGardenStore((s) => s.freeCameraMode)
  const cameraLocked = useGardenStore((s) => s.cameraLocked)
  const toggle = useGardenStore((s) => s.toggleCameraLocked)

  if (!editorMode || !freeCameraMode) return null

  return (
    <button
      onClick={toggle}
      data-no-camera-drag="true"
      title={cameraLocked ? 'Kamera entsperren' : 'Kamera sperren (kein Orbit per Linksklick-Drag)'}
      style={{
        position: 'fixed',
        top: '16px',
        right: '292px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: 600,
        fontFamily: 'system-ui, sans-serif',
        color: '#fff',
        background: cameraLocked ? 'rgba(220, 38, 38, 0.9)' : 'rgba(51, 65, 85, 0.92)',
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
      {cameraLocked ? (
        /* Locked padlock icon */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ) : (
        /* Unlocked padlock icon */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </svg>
      )}
      Kamera sperren
    </button>
  )
}
