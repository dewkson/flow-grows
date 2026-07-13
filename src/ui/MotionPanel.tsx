import { useEffect, useState } from 'react'
import { useGardenStore, DEFAULT_MOTION_THRESHOLDS, DEFAULT_CHARACTER_LERP_SPEED, DEFAULT_CHARACTER_MAX_SPEED } from '../store/gardenStore'
import { characterMotion } from '../character/characterMotion'

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
        <span>{value.toFixed(2)}</span>
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

export function MotionPanel() {
  const editorMode = useGardenStore((s) => s.editorMode)
  const activeEditorPanel = useGardenStore((s) => s.activeEditorPanel)
  const setActiveEditorPanel = useGardenStore((s) => s.setActiveEditorPanel)
  const motionThresholds = useGardenStore((s) => s.motionThresholds)
  const setMotionThresholds = useGardenStore((s) => s.setMotionThresholds)
  const characterLerpSpeed = useGardenStore((s) => s.characterLerpSpeed)
  const setCharacterLerpSpeed = useGardenStore((s) => s.setCharacterLerpSpeed)
  const characterMaxSpeed = useGardenStore((s) => s.characterMaxSpeed)
  const setCharacterMaxSpeed = useGardenStore((s) => s.setCharacterMaxSpeed)

  const [liveSpeed, setLiveSpeed] = useState(0)
  const [liveState, setLiveState] = useState(characterMotion.state)

  const isOpen = editorMode && activeEditorPanel === 'motion'

  // Poll the character's live speed/state for display while the panel is open
  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => {
      setLiveSpeed(characterMotion.speed)
      setLiveState(characterMotion.state)
    }, 100)
    return () => clearInterval(interval)
  }, [isOpen])

  if (!isOpen) return null

  const resetDefaults = () => {
    setMotionThresholds(DEFAULT_MOTION_THRESHOLDS)
    setCharacterLerpSpeed(DEFAULT_CHARACTER_LERP_SPEED)
    setCharacterMaxSpeed(DEFAULT_CHARACTER_MAX_SPEED)
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
        <strong style={{ fontSize: 14 }}>Bewegung</strong>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={resetDefaults}
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
            Zurücksetzen
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

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          opacity: 0.7,
          marginBottom: 12,
          padding: '6px 8px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 6,
        }}
      >
        <span>Aktuelle Geschwindigkeit</span>
        <span>{liveSpeed.toFixed(2)} u/s · {liveState}</span>
      </div>

      <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Position
      </div>
      <SliderRow
        label="Lerp-Geschwindigkeit (Ziel & Stopp)"
        value={characterLerpSpeed}
        min={0.02}
        max={0.4}
        step={0.005}
        onChange={setCharacterLerpSpeed}
      />
      <SliderRow
        label="Maximalgeschwindigkeit (u/s)"
        value={characterMaxSpeed}
        min={1}
        max={30}
        step={0.5}
        onChange={setCharacterMaxSpeed}
      />

      <div style={{ fontSize: 11, opacity: 0.6, margin: '10px 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Walk
      </div>
      <SliderRow
        label="Enter (idle → walk)"
        value={motionThresholds.walkEnter}
        min={0}
        max={5}
        step={0.05}
        onChange={(v) => setMotionThresholds({ walkEnter: v })}
      />
      <SliderRow
        label="Exit (walk → idle)"
        value={motionThresholds.walkExit}
        min={0}
        max={5}
        step={0.05}
        onChange={(v) => setMotionThresholds({ walkExit: v })}
      />

      <div style={{ fontSize: 11, opacity: 0.6, margin: '10px 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Run
      </div>
      <SliderRow
        label="Enter (walk → run)"
        value={motionThresholds.runEnter}
        min={0}
        max={20}
        step={0.1}
        onChange={(v) => setMotionThresholds({ runEnter: v })}
      />
      <SliderRow
        label="Exit (run → walk)"
        value={motionThresholds.runExit}
        min={0}
        max={20}
        step={0.1}
        onChange={(v) => setMotionThresholds({ runExit: v })}
      />
    </div>
  )
}
