'use client'

import type { VocabularyEntry } from '@whatslux/shared'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AudioButton } from './AudioButton'
import { Lu, withArticle } from './Lu'
import { LESSON_SIZE } from '@/lib/exercises'
import { t } from '@/lib/i18n'
import { loadCards, type StoredCard } from '@/lib/srs-store'
import { isReviewDue, strengthOf, type Strength } from '@/lib/strength'

function StrengthBars({ s }: { s: Strength }) {
  return (
    <span className={`strength strength--${s}`} title={t.strength[s]} aria-label={t.strength[s]}>
      <i />
      <i />
      <i />
    </span>
  )
}

export function Hub({ entries }: { entries: VocabularyEntry[] }) {
  const [cards, setCards] = useState<Record<string, StoredCard> | null>(null)
  const [category, setCategory] = useState('ALL')
  useEffect(() => setCards(loadCards()), [])

  const c = cards ?? {}
  const newCount = Math.min(LESSON_SIZE, entries.filter((v) => !c[v.id]).length)
  const dueCount = entries.filter((v) => isReviewDue(c[v.id])).length
  const categories = [...new Set(entries.map((e) => e.category))]
  const shown = entries.filter((v) => category === 'ALL' || v.category === category)

  return (
    <>
      <div className="actions">
        <Link href="/learn" className={`action action--learn${newCount ? '' : ' is-disabled'}`} aria-disabled={!newCount}>
          <span className="action__icon">📘</span>
          <span className="action__text">
            <strong>{t.newLesson}</strong>
            <span>{t.newWords(newCount)}</span>
          </span>
          <span className="action__go">{t.start}</span>
        </Link>
        <Link href="/review" className={`action action--review${dueCount ? '' : ' is-disabled'}`} aria-disabled={!dueCount}>
          <span className="action__icon">🧠</span>
          <span className="action__text">
            <strong>{t.smartReview}</strong>
            <span>{t.reviewCount(dueCount)}</span>
          </span>
          <span className="action__go">{t.start}</span>
        </Link>
      </div>

      <h2 className="section-title">{t.myWords}</h2>
      <div className="chips" role="tablist">
        {['ALL', ...categories].map((k) => (
          <button key={k} role="tab" aria-selected={category === k} className={`chip${category === k ? ' is-active' : ''}`} onClick={() => setCategory(k)}>
            {k === 'ALL' ? t.all : (t.categories[k] ?? k)}
          </button>
        ))}
      </div>
      <ul className="words">
        {shown.map((v) => (
          <li key={v.id} className="word-row">
            {v.lod.audio ? <AudioButton audio={v.lod.audio} size="sm" /> : <span className="audio-placeholder" />}
            <div className="word-row__text">
              <Lu className="word-row__lu">{withArticle(v)}</Lu>
              <span className="word-row__ar">{v.translations.ar}</span>
            </div>
            <StrengthBars s={strengthOf(c[v.id])} />
          </li>
        ))}
      </ul>
    </>
  )
}
