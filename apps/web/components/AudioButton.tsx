'use client'

import { useRef, useState } from 'react'
import { t } from '@/lib/i18n'

/** AAC plays everywhere incl. iPhone; some Chromium builds only have OGG. Ask first, fall back on failure. */
function sources(audio: { aac: string; ogg: string }): string[] {
  const aacOk = typeof Audio !== 'undefined' && new Audio().canPlayType('audio/mp4; codecs="mp4a.40.2"') !== ''
  return aacOk ? [audio.aac, audio.ogg] : [audio.ogg, audio.aac]
}

export function AudioButton({ audio, size = 'lg', label = t.listen }: { audio: { aac: string; ogg: string }; size?: 'lg' | 'sm'; label?: string }) {
  const [state, setState] = useState<'idle' | 'playing' | 'error'>('idle')
  const ref = useRef<HTMLAudioElement | null>(null)

  const play = async (e: React.MouseEvent) => {
    e.stopPropagation() // don't flip the card
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
