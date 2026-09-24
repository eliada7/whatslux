'use client'

import type { VocabularyEntry } from '@whatslux/shared'
import { AudioButton } from './AudioButton'
import { t } from '@/lib/i18n'

/** Luxembourgish is always isolated LTR inside the RTL page, so "d'" never jumps sides. */
export const Lu = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <bdi dir="ltr" lang="lb" className={`lu ${className}`}>
    {children}
  </bdi>
)

/** Why this word takes its article — the n-rule explained on the word itself. */
function GenderTip({ v, gender }: { v: VocabularyEntry; gender: string }) {
  if (gender !== 'M')
    return (
      <>
        {t.gender[gender]} ← {t.always} <Lu className="tip-art">d'</Lu>
      </>
    )
  const first = v.word.charAt(0)
  const vowel = /[aeiouäëéèêàâîïôöüû]/i.test(first)
  const keep = v.article === 'den'
  return (
    <>
      {t.gender.M} ← <Lu className="tip-art">{v.article}</Lu> · {keep ? t.nRule.keep : t.nRule.drop}{' '}
      {vowel ? t.nRule.vowel : <Lu className="tip-art">{first.toUpperCase()}</Lu>}
    </>
  )
}

const articleText = (v: VocabularyEntry) => (v.article ? (v.article.endsWith("'") ? v.article : `${v.article} `) : '')

export function Flashcard({ entry: v, flipped, onFlip }: { entry: VocabularyEntry; flipped: boolean; onFlip: () => void }) {
  const gender = v.gender?.length === 1 ? v.gender : undefined

  return (
    <div
      className={`card${flipped ? ' is-flipped' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      onClick={onFlip}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onFlip())}
    >
      <div className="card__inner">
        {/* ── Front: the Luxembourgish word ─────────────── */}
        <div className="card__face card__front" aria-hidden={flipped}>
          <div className="card__meta">
            <span className="badge">{v.level}</span>
            {gender && <span className={`badge badge--g${gender}`}>{t.gender[gender]}</span>}
          </div>
          <div className="card__word">
            <Lu>
              {v.article && <span className="article">{articleText(v)}</span>}
              <span className="headword">{v.word}</span>
            </Lu>
          </div>
          {v.lod.audio && <AudioButton audio={v.lod.audio} />}
          <p className="card__hint">{t.tapToFlip}</p>
        </div>

        {/* ── Back: meaning, grammar, example ───────────── */}
        <div className="card__face card__back" aria-hidden={!flipped}>
          <div className="back__top">
            <Lu className="back__lu">
              {articleText(v)}
              {v.word}
            </Lu>
            {v.lod.audio && <AudioButton audio={v.lod.audio} size="sm" />}
          </div>

          <p className="back__ar">{v.translations.ar}</p>

          <dl className="facts">
            {v.plural && (
              <div className="fact">
                <dt>{t.plural}</dt>
                <dd>
                  <Lu>d'{v.plural}</Lu>
                </dd>
              </div>
            )}
            {gender && (
              <div className="fact">
                <dt>🧠</dt>
                <dd>
                  <GenderTip v={v} gender={gender} />
                </dd>
              </div>
            )}
          </dl>

          {v.exampleLu && (
            <div className="example">
              <div className="example__head">
                <span>🗣️ {t.example}</span>
                {v.exampleAudio && <AudioButton audio={v.exampleAudio} size="sm" />}
              </div>
              <p className="example__lu">
                <Lu>{v.exampleLu}</Lu>
              </p>
              {v.exampleTranslations?.ar ? (
                <p className="example__ar">{v.exampleTranslations.ar}</p>
              ) : (
                <p className="example__note">{t.exampleNote}</p>
              )}
            </div>
          )}

          {v.lod.url && (
            <a className="lod-link" href={v.lod.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
              ✅ {t.verified} · {t.openInLod} ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
