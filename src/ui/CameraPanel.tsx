import { useGardenStore, DEFAULT_CAMERA_ZOOM } from '../store/gardenStore'
import { DEFAULT_CAMERA_TILT_DEG } from '../world/constants'

type SliderRowProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

function SliderRow({ label, value, min, max, step, onChange }: SliderRowProps) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.8, marginBottom: 2 }}>
        <span>{label}</span>
        <span>{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  )
}

export function CameraPanel() {
  const editorMode = useGardenStore((s) => s.editorMode)
  const activeEditorPanel = useGardenStore((s) => s.activeEditorPanel)
  const setActiveEditorPanel = useGardenStore((s) => s.setActiveEditorPanel)
  const cameraZoom = useGardenStore((s) => s.cameraZoom)
  const setCameraZoom = useGardenStore((s) => s.setCameraZoom)
  const cameraTiltDeg = useGardenStore((s) => s.cameraTiltDeg)
  const setCameraTiltDeg = useGardenStore((s) => s.setCameraTiltDeg)
  const freeCameraMode = useGardenStore((s) => s.freeCameraMode)
  const requestCapturePerspective = useGardenStore((s) => s.requestCapturePerspective)

  const isOpen = editorMode && activeEditorPanel === 'camera'

  if (!isOpen) return null

  const resetDefaults = () => {
    setCameraZoom(DEFAULT_CAMERA_ZOOM)
    setCameraTiltDeg(DEFAULT_CAMERA_TILT_DEG)
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
        minWidth: 260,
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <strong style={{ fontSize: 14 }}>Kamera</strong>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={resetDefaults} style={buttonStyle}>
            Zurücksetzen
          </button>
          <button onClick={() => setActiveEditorPanel('none')} style={buttonStyle}>
            Schließen
          </button>
        </div>
      </div>

      <SliderRow label="Entfernung (Zoom)" value={cameraZoom} min={15} max={150} step={1} onChange={setCameraZoom} />
      <SliderRow label="Neigungswinkel (°)" value={cameraTiltDeg} min={10} max={80} step={1} onChange={setCameraTiltDeg} />

      <button
        onClick={requestCapturePerspective}
        disabled={!freeCameraMode}
        title={freeCameraMode ? undefined : 'Erfordert den Freie-Kamera-Modus'}
        style={{
          ...buttonStyle,
          width: '100%',
          marginTop: 8,
          padding: '8px 10px',
          background: freeCameraMode ? 'rgba(99, 102, 241, 0.9)' : 'rgba(148, 163, 184, 0.2)',
          cursor: freeCameraMode ? 'pointer' : 'not-allowed',
          opacity: freeCameraMode ? 1 : 0.5,
        }}
      >
        Editor-Perspektive für Play-Modus übernehmen
      </button>
    </div>
  )
}

const buttonStyle: React.CSSProperties = {
  background: 'rgba(148, 163, 184, 0.35)',
  border: 'none',
  borderRadius: 6,
  color: '#fff',
  padding: '4px 10px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 12,
}
