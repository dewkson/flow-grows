import { useState, useRef, useEffect, useCallback } from 'react'
import { Text, Html, Billboard } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RoundedPanel } from './RoundedPanel'
import { useGardenStore } from '../store/gardenStore'
import type { ContentArea } from '../data/contentArea'

type EditableTextPanelProps = {
  data: ContentArea
  isNearby: boolean
}

const PANEL_WIDTH = 12
const PANEL_HEIGHT = 7
const PANEL_RADIUS = 0.8
const PANEL_COLOR = '#1e293b'
const PANEL_OPACITY = 0.92
const TITLE_SIZE = 1.2
const BODY_SIZE = 0.6
const TEXT_COLOR = '#f1f5f9'
const TITLE_COLOR = '#e2e8f0'
const PADDING_TOP = 1.8
const FADE_SPEED = 8

export function EditableTextPanel({ data, isNearby }: EditableTextPanelProps) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(data.description)
  const [visible, setVisible] = useState(false)
  const [fade, setFade] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fadeRef = useRef(0)

  const updateContentText = useGardenStore((s) => s.updateContentText)
  const editorMode = useGardenStore((s) => s.editorMode)
  const setIsEditingText = useGardenStore((s) => s.setIsEditingText)

  const panelOffset = data.panelConfig?.offset ?? [8, 0, 10]
  const panelColor = data.panelConfig?.panelColor ?? PANEL_COLOR
  const titleColor = data.panelConfig?.titleColor ?? TITLE_COLOR
  const textColor = data.panelConfig?.textColor ?? TEXT_COLOR

  // Notify store when editing state changes
  useEffect(() => {
    setIsEditingText(editing)
    return () => setIsEditingText(false)
  }, [editing, setIsEditingText])

  // Fade animation – lerp opacity each frame
  useFrame((_, delta) => {
    const target = isNearby ? 1 : 0
    fadeRef.current += (target - fadeRef.current) * Math.min(1, FADE_SPEED * delta)

    // Snap to bounds
    if (fadeRef.current < 0.005) fadeRef.current = 0
    if (fadeRef.current > 0.995) fadeRef.current = 1

    // Mount/unmount
    if (fadeRef.current > 0 && !visible) setVisible(true)
    if (fadeRef.current === 0 && visible && !isNearby) setVisible(false)

    // Push to state so children re-render with new opacity
    setFade(fadeRef.current)
  })

  // Auto-focus textarea when editing starts
  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length,
      )
    }
  }, [editing])

  const handleSave = useCallback(() => {
    updateContentText(data.id, editText)
    setEditing(false)
  }, [data.id, editText, updateContentText])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Escape to cancel, Ctrl+Enter / Cmd+Enter to save
      if (e.key === 'Escape') {
        setEditText(data.description)
        setEditing(false)
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSave()
      }
    },
    [data.description, handleSave],
  )

  if (!visible) return null

  return (
    <Billboard follow lockX={false} lockY={false} lockZ={false}>
      <group position={[panelOffset[0], PANEL_HEIGHT / 2 + 0.3 + panelOffset[1], panelOffset[2]]}>
        {/* Rounded background panel – XY plane, camera-facing via Billboard */}
        <RoundedPanel
          width={PANEL_WIDTH}
          height={PANEL_HEIGHT}
          radius={PANEL_RADIUS}
          color={panelColor}
          opacity={PANEL_OPACITY * fade}
        />

        {/* Title text */}
        <Text
          position={[0, PANEL_HEIGHT / 2 - PADDING_TOP, 0.02]}
          renderOrder={12}
          fontSize={TITLE_SIZE}
          maxWidth={PANEL_WIDTH - 2}
          color={titleColor}
          fillOpacity={fade}
          anchorX="center"
          anchorY="middle"
          textAlign="center"
          fontWeight="bold"
          outlineWidth={0.02}
          outlineColor="#000000"
          outlineOpacity={fade}
        >
          {data.title}
        </Text>

        {/* Body text (read-only display) – only visible when NOT editing */}
        {!editing && (
          <Text
            position={[0, 0.4, 0.02]}
            renderOrder={12}
            fontSize={BODY_SIZE}
            maxWidth={PANEL_WIDTH - 2}
            color={textColor}
            fillOpacity={fade}
            anchorX="center"
            anchorY="top"
            textAlign="center"
            outlineWidth={0.015}
            outlineColor="#000000"
            outlineOpacity={fade}
          >
            {data.description}
          </Text>
        )}

        {/* Editable HTML overlay – shown when editing */}
        {editing && (
          <Html
            position={[0, 0.4, 0.03]}
            transform
            occlude={false}
            style={{
              width: '360px',
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '15px',
                  lineHeight: '1.5',
                  fontFamily: 'system-ui, sans-serif',
                  color: '#f1f5f9',
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '2px solid rgba(99, 102, 241, 0.6)',
                  borderRadius: '10px',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '6px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#fff',
                    background: '#4f46e5',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditText(data.description)
                    setEditing(false)
                  }}
                  style={{
                    padding: '6px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#cbd5e1',
                    background: 'rgba(51, 65, 85, 0.9)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  color: '#64748b',
                }}
              >
                Ctrl+Enter to save · Escape to cancel
              </span>
            </div>
          </Html>
        )}

        {/* Edit icon – top-right corner, visible in editor mode when nearby */}
        {editorMode && isNearby && !editing && (
          <Html
            position={[PANEL_WIDTH / 2 - 0.6, PANEL_HEIGHT / 2 - 0.6, 0.03]}
            transform
            occlude={false}
            style={{ pointerEvents: 'auto' }}
          >
            <button
              onClick={() => {
                setEditText(data.description)
                setEditing(true)
              }}
              title="Edit"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                padding: 0,
                background: 'rgba(99, 102, 241, 0.85)',
                border: 'none',
                borderRadius: '7px',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '15px',
                lineHeight: 1,
                backdropFilter: 'blur(4px)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.85)')}
            >
              {/* Pencil icon (SVG) */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>
          </Html>
        )}
      </group>
    </Billboard>
  )
}
