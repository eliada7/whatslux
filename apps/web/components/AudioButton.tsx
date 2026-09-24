'use client'

import { useEffect, useRef, useState } from 'react'
import { t } from '@/lib/i18n'

/** AAC plays everywhere incl. iPhone; some Chromium builds only have OGG. Ask first, fall back on failure. */
function sources(audio: { aac: string; ogg: string }): string[] {
  const aacOk = typeof Audio !== 'undefined' && new Audio().canPlayType('audio/mp4; codecs="mp4a.40.2"') !== ''
  return aacOk ? [audio.aac, audio.ogg] : [audio.ogg, audio.aac]
}

export function AudioButton({
  audio,
  size = 'lg',
  label = t.listen,
  autoPlay = false,
}: {
  audio: { aac: string; ogg: string }
  size?: 'lg' | 'sm' | 'xl'
  label?: string
  autoPlay?: boolean
}) {
  const [state, setState] = useState<'idle' | 'playing' | 'error'>('idle')
  const ref = useRef<HTMLAudioElement | null>(null)

  const play = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    ref.current?.pause()
    for (const src of sources(audio)) {
      const el = new Audio(src)
      ref.current = el
      el.onended = () => setState('idle')
      try {
        setState('playing')
        await el.play()
        return
      } catch {
        /* try the next format */
      }
    }
    setState('error')
  }

  // Busuu plays the word as it appears. Browsers may block this without a tap —
  // then the button is still there.
  useEffect(() => {
    if (!autoPlay) return
    const el = new Audio(sources(audio)[0])
    ref.current = el
    el.onended = () => setState('idle')
    el.play().then(
      () => setState('playing'),
      () => setState('idle'),
    )
    return () => el.pause()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio.aac, autoPlay])

  return (
    <button
      type="button"
      className={`audio-btn audio-btn--${size}${state === 'playing' ? ' is-playing' : ''}`}
      onClick={play}
      aria-label={label}
      title={label}
    >
      <span aria-hidden>{state === 'error' ? '⚠️' : '🔊'}</span>
    </button>
  )
}
