'use client'

import { calculateNextReview, isDue, mapRatingToQuality, type Rating, type VocabularyEntry } from '@whatslux/shared'
import { useEffect, useMemo, useState } from 'react'
import { Flashcard } from './Flashcard'
import { t } from '@/lib/i18n'
import { cardOf, loadCards, saveCards, type StoredCard } from '@/lib/srs-store'

const RATINGS: Rating[] = ['AGAIN', 'HARD', 'OK', 'EASY']

export function Deck({ entries }: { entries: VocabularyEntry[] }) {
  const [category, setCategory] = useState<string>('ALL')
  const [cards, setCards] = useState<Record<string, StoredCard>>({})
  const [queue, setQueue] = useState<string[]>([])
  const [done, setDone] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const categories = useMemo(() => [...new Set(entries.map((e) => e.category))], [entries])
  const byId = useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries])

  // Build the session: due cards first (new cards count as due), then the rest.
  const start = (cat: string, stored = cards) => {
    const pool = entries.filter((e) => cat === 'ALL' || e.category === cat)
    const due = (id: string) => !stored[id] || isDue(new Date(stored[id].nextReviewAt))
    setQueue([...pool.filter((e) => due(e.id)), ...pool.filter((e) => !due(e.id))].map((e) => e.id))
    setDone(0)
    setFlipped(false)
  }

  useEffect(() => {
    const stored = loadCards()
    setCards(stored)
    start('ALL', stored)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries])

  const current = queue[0] ? byId.get(queue[0]) : undefined
  const total = done + queue.length

  const rate = (rating: Rating) => {
    if (!current) return
    const next = calculateNextReview(cardOf(cards, current.id), mapRatingToQuality(rating))
    const updated = { ...cards, [current.id]: { ...next, nextReviewAt: next.nextReviewAt.toISOString() } }
    setCards(updated)
    saveCards(updated)
    // A forgotten word comes back at the end of this session.
    setQueue((q) => (rating === 'AGAIN' ? [...q.slice(1), q[0]] : q.slice(1)))
    if (rating !== 'AGAIN') setDone((d) => d + 1)
    setFlipped(false)
  }

  if (!entries.length) return <p className="empty">{t.empty}</p>

  return (
    <section className="deck">
      <div className="chips" role="tablist">
        {['ALL', ...categories].map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={category === c}
            className={`chip${category === c ? ' is-active' : ''}`}
            onClick={() => {
              setCategory(c)
              start(c)
            }}
          >
            {c === 'ALL' ? t.all : (t.categories[c] ?? c)}
          </button>
        ))}
      </div>

      <div className="progress" aria-label={t.progress(done, total)}>
        <div className="progress__bar" style={{ width: `${total ? (100 * done) / total : 0}%` }} />
        <span className="progress__label">{t.progress(done, total)}</span>
      </div>

      {current ? (
        <>
          <Flashcard key={current.id} entry={current} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
          <div className={`ratings${flipped ? ' is-visible' : ''}`} aria-hidden={!flipped}>
            <p className="ratings__q">{t.howWell}</p>
            <div className="ratings__row">
              {RATINGS.map((r) => {
                const preview = calculateNextReview(cardOf(cards, current.id), mapRatingToQuality(r))
                return (
                  <button key={r} className={`rate rate--${r}`} onClick={() => rate(r)} tabIndex={flipped ? 0 : -1}>
                    <span className="rate__label">{t.ratings[r]}</span>
                    <span className="rate__when">{r === 'AGAIN' ? t.now : t.inDays(preview.interval)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="done">
          <h2>{t.doneTitle}</h2>
          <p>{t.doneBody}</p>
          <button className="btn-primary" onClick={() => start(category)}>
            {t.restart}
          </button>
        </div>
      )}
    </section>
  )
}
