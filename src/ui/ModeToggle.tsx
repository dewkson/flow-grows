import { useGardenStore } from '../store/gardenStore'

export function ModeToggle() {
  const editorMode = useGardenStore((s) => s.editorMode)
  const toggle = useGardenStore((s) => s.toggleEditorMode)

  return (
    <button
      onClick={toggle}
      title={editorMode ? 'Switch to Play mode' : 'Switch to Editor mode'}
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: 600,
        fontFamily: 'system-ui, sans-serif',
        color: '#fff',
        background: editorMode ? 'rgba(99, 102, 241, 0.9)' : 'rgba(34, 197, 94, 0.9)',
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
      {editorMode ? (
        /* Pencil icon */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
      ) : (
        /* Play icon */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <polygon points="6,3 20,12 6,21" />
        </svg>
      )}
      {editorMode ? 'Editor' : 'Play'}
    </button>
  )
}
