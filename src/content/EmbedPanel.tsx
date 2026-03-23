import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useGardenStore } from '../store/gardenStore'
import type { EmbedVariant } from '../data/contentArea'

function isValidEmbedUrl(url: string, variant: EmbedVariant): boolean {
  try {
    const parsed = new URL(url)
    if (variant === 'soundcloud') {
      return parsed.hostname === 'soundcloud.com' || parsed.hostname.endsWith('.soundcloud.com')
    }
    if (variant === 'itchio') {
      return parsed.hostname.endsWith('.itch.io') || parsed.hostname === 'itch.io'
    }
    return false
  } catch {
    return false
  }
}

function buildSoundCloudSrc(trackUrl: string): string {
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%236366f1&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`
}

/** itch.io embed URLs are typically https://itch.io/embed/GAMEID or the full game page URL */
function buildItchioSrc(gameUrl: string): string {
  // If already an embed URL, use directly
  if (gameUrl.includes('/embed/') || gameUrl.includes('/embed-upload/')) return gameUrl
  // Otherwise assume it's a game page, no transformation needed — itch.io iframe embeds
  return gameUrl
}

const VARIANT_CONFIG: Record<EmbedVariant, {
  panelWidth: string
  panelMaxWidth: string
  panelMaxHeight: string
  iframeHeight: string
  placeholder: string
  emptyTextEditor: string
  emptyText: string
  addLabel: string
  errorText: string
  itemTitle: (i: number) => string
}> = {
  soundcloud: {
    panelWidth: '90vw',
    panelMaxWidth: '520px',
    panelMaxHeight: '80vh',
    iframeHeight: '166px',
    placeholder: 'https://soundcloud.com/artist/track',
    emptyTextEditor: 'Noch keine Tracks vorhanden. Füge unten eine SoundCloud-URL hinzu.',
    emptyText: 'Keine Tracks vorhanden.',
    addLabel: '+ Track',
    errorText: 'Bitte eine gültige SoundCloud-URL eingeben',
    itemTitle: (i) => `SoundCloud Track ${i + 1}`,
  },
  itchio: {
    panelWidth: '95vw',
    panelMaxWidth: '960px',
    panelMaxHeight: '90vh',
    iframeHeight: '175px',
    placeholder: 'https://itch.io/embed/GAMEID',
    emptyTextEditor: 'Noch kein Spiel vorhanden. Füge unten eine itch.io Embed-URL hinzu (https://itch.io/embed/...).',
    emptyText: 'Kein Spiel vorhanden.',
    addLabel: '+ Game',
    errorText: 'Bitte eine gültige itch.io-URL eingeben (https://itch.io/embed/... oder https://user.itch.io/game)',
    itemTitle: (i) => `Game ${i + 1}`,
  },
}

export function EmbedPanel() {
  const isEmbedOpen = useGardenStore((s) => s.isEmbedOpen)
  const activeEmbedContentId = useGardenStore((s) => s.activeEmbedContentId)
  const contentAreas = useGardenStore((s) => s.contentAreas)
  const closeEmbedPanel = useGardenStore((s) => s.closeEmbedPanel)
  const editorMode = useGardenStore((s) => s.editorMode)
  const updateEmbedUrls = useGardenStore((s) => s.updateEmbedUrls)

  const [newUrl, setNewUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)

  const area = contentAreas.find((a) => a.id === activeEmbedContentId)
  const embedUrls = useMemo(() => area?.embedUrls ?? [], [area?.embedUrls])
  const variant: EmbedVariant = area?.embedVariant ?? 'soundcloud'
  const config = VARIANT_CONFIG[variant]
  const fade = isEmbedOpen ? 1 : 0

  // Close on Escape
  useEffect(() => {
    if (!isEmbedOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeEmbedPanel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEmbedOpen, closeEmbedPanel])

  // Close on click outside panel
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closeEmbedPanel()
      }
    },
    [closeEmbedPanel],
  )

  const handleAddUrl = useCallback(() => {
    const trimmed = newUrl.trim()
    if (!trimmed) return
    if (!isValidEmbedUrl(trimmed, variant)) {
      setUrlError(config.errorText)
      return
    }
    if (!activeEmbedContentId) return
    updateEmbedUrls(activeEmbedContentId, [...embedUrls, trimmed])
    setNewUrl('')
    setUrlError('')
  }, [newUrl, variant, config.errorText, activeEmbedContentId, embedUrls, updateEmbedUrls])

  const handleRemoveUrl = useCallback(
    (index: number) => {
      if (!activeEmbedContentId) return
      updateEmbedUrls(
        activeEmbedContentId,
        embedUrls.filter((_, i) => i !== index),
      )
    },
    [activeEmbedContentId, embedUrls, updateEmbedUrls],
  )

  const handleUrlKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleAddUrl()
      }
      e.stopPropagation()
    },
    [handleAddUrl],
  )

  if (!isEmbedOpen || !area) return null

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `rgba(0, 0, 0, ${0.5 * fade})`,
        backdropFilter: `blur(${4 * fade}px)`,
        opacity: fade,
        transition: 'opacity 0.3s ease, backdrop-filter 0.3s ease',
        pointerEvents: 'auto',
      }}
    >
      <div
        ref={panelRef}
        style={{
          position: 'relative',
          width: config.panelWidth,
          maxWidth: config.panelMaxWidth,
          maxHeight: config.panelMaxHeight,
          background: 'linear-gradient(135deg, #1e1b4b, #1e293b)',
          borderRadius: '16px',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transform: `scale(${0.95 + 0.05 * fade})`,
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#e2e8f0',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              {area.title}
            </span>
          </div>
          <button
            onClick={closeEmbedPanel}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#94a3b8',
              fontSize: '18px',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'
              e.currentTarget.style.color = '#fca5a5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              e.currentTarget.style.color = '#94a3b8'
            }}
            title="Schließen (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {embedUrls.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                color: '#64748b',
                fontSize: '14px',
                fontFamily: 'system-ui, sans-serif',
                padding: '32px 0',
              }}
            >
              {editorMode ? config.emptyTextEditor : config.emptyText}
            </div>
          )}

          {embedUrls.map((url, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <iframe
                title={config.itemTitle(index)}
                width="100%"
                height={config.iframeHeight}
                scrolling="no"
                frameBorder="no"
                allow="autoplay; fullscreen"
                src={variant === 'soundcloud' ? buildSoundCloudSrc(url) : buildItchioSrc(url)}
                sandbox={variant === 'itchio'
                  ? 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms'
                  : 'allow-scripts allow-same-origin allow-popups'
                }
                style={{
                  borderRadius: '10px',
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                }}
              />
              {editorMode && (
                <button
                  onClick={() => handleRemoveUrl(index)}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(239, 68, 68, 0.85)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 700,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.85)')}
                  title="Entfernen"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Editor: Add new track */}
        {editorMode && (
          <div
            style={{
              padding: '12px 20px 16px',
              borderTop: '1px solid rgba(99, 102, 241, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => {
                  setNewUrl(e.target.value)
                  setUrlError('')
                }}
                onKeyDown={handleUrlKeyDown}
                placeholder={config.placeholder}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontFamily: 'system-ui, sans-serif',
                  color: '#f1f5f9',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: urlError
                    ? '1.5px solid rgba(239, 68, 68, 0.6)'
                    : '1.5px solid rgba(99, 102, 241, 0.4)',
                  borderRadius: '8px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={handleAddUrl}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#fff',
                  background: '#6366f1',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#4f46e5')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#6366f1')}
              >
                {config.addLabel}
              </button>
            </div>
            {urlError && (
              <span
                style={{
                  fontSize: '12px',
                  color: '#f87171',
                  fontFamily: 'system-ui, sans-serif',
                }}
              >
                {urlError}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
