'use client'

import type { VocabularyEntry } from '@whatslux/shared'
import { useMemo, useState } from 'react'
import { AudioButton } from '../AudioButton'
import { GenderTip, Lu, withArticle } from '../Lu'
import { t } from '@/lib/i18n'

/**
 * correct=false re-queues the step. `missed` marks words the learner got wrong
 * without re-queueing (matching: the learner already corrected them in place).
 */
export type Answer = (correct: boolean, correction?: React.ReactNode, missed?: string[]) => void
type Dict = Map<string, VocabularyEntry>

/** Presentation card: word, sound, meaning, example — all at once, like Busuu. */
export function IntroStep({ v }: { v: VocabularyEntry }) {
  return (
    <div className="step intro">
      <span className="pill">✨ {t.newWord}</span>
      <div className="intro__word">
        <Lu>
          {v.article && <span className="article">{withArticle(v).slice(0, -v.word.length)}</span>}
          <span className="headword">{v.word}</span>
        </Lu>
      </div>
      {v.lod.audio && <AudioButton audio={v.lod.audio} autoPlay />}
      <p className="intro__ar">{v.translations.ar}</p>
      <dl className="facts">
        {v.plural && (
          <div className="fact">
            <dt>{t.plural}</dt>
            <dd>
              <Lu>d'{v.plural}</Lu>
            </dd>
          </div>
        )}
        {v.gender?.length === 1 && (
          <div className="fact">
            <dt>🧠</dt>
            <dd>
              <GenderTip v={v} />
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
          <p className="example__note">{v.exampleTranslations?.ar ?? t.exampleNote}</p>
        </div>
      )}
      {v.lod.url && (
        <a className="lod-link" href={v.lod.url} target="_blank" rel="noreferrer">
          ✅ {t.verified} ↗
        </a>
      )}
    </div>
  )
}

/** Multiple choice: shared by meaning / listen / article steps. */
function Choice({
  prompt,
  stem,
  options,
  correct,
  render,
  onAnswer,
  correction,
  ltrOptions,
}: {
  prompt: string
  stem: React.ReactNode
  options: string[]
  correct: string
  render: (o: string) => React.ReactNode
  onAnswer: Answer
  correction: React.ReactNode
  ltrOptions?: boolean
}) {
  const [picked, setPicked] = useState<string>()
  const pick = (o: string) => {
    if (picked) return
    setPicked(o)
    onAnswer(o === correct, correction)
  }
  return (
    <div className="step">
      <h2 className="prompt">{prompt}</h2>
      <div className="stem">{stem}</div>
      <div className={`options${ltrOptions ? ' options--lu' : ''}`}>
        {options.map((o) => {
          const state = !picked ? '' : o === correct ? ' is-correct' : o === picked ? ' is-wrong' : ' is-dim'
          return (
            <button key={o} className={`option${state}`} onClick={() => pick(o)} disabled={!!picked}>
              {render(o)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function MeaningStep({ v, options, dict, onAnswer }: { v: VocabularyEntry; options: string[]; dict: Dict; onAnswer: Answer }) {
  return (
    <Choice
      prompt={t.prompts.meaning}
      stem={
        <div className="stem__lu">
          <Lu className="big-lu">{withArticle(v)}</Lu>
          {v.lod.audio && <AudioButton audio={v.lod.audio} size="sm" autoPlay />}
        </div>
      }
      options={options}
      correct={v.id}
      render={(id) => dict.get(id)?.translations.ar}
      onAnswer={onAnswer}
      correction={
        <>
          <Lu>{withArticle(v)}</Lu> = {v.translations.ar}
        </>
      }
    />
  )
}

export function ListenStep({ v, options, dict, onAnswer }: { v: VocabularyEntry; options: string[]; dict: Dict; onAnswer: Answer }) {
  return (
    <Choice
      prompt={t.prompts.listen}
      stem={v.lod.audio && <AudioButton audio={v.lod.audio} size="xl" autoPlay />}
      options={options}
      correct={v.id}
      ltrOptions
      render={(id) => <Lu>{dict.get(id)?.word}</Lu>}
      onAnswer={onAnswer}
      correction={
        <>
          <Lu>{withArticle(v)}</Lu> = {v.translations.ar}
        </>
      }
    />
  )
}

export function ArticleStep({ v, options, onAnswer }: { v: VocabularyEntry; options: string[]; onAnswer: Answer }) {
  return (
    <Choice
      prompt={t.prompts.article}
      stem={
        <div className="stem__lu">
          <Lu className="big-lu">
            <span className="blank">___</span> {v.word}
          </Lu>
          <span className="stem__ar">{v.translations.ar}</span>
        </div>
      }
      options={options}
      correct={v.article!}
      ltrOptions
      render={(a) => <Lu>{a}</Lu>}
      onAnswer={onAnswer}
      correction={
        <>
          <Lu>{withArticle(v)}</Lu>
          <br />
          <small>
            <GenderTip v={v} />
          </small>
        </>
      }
    />
  )
}

/** Tap a Luxembourgish word, then its meaning. Mistakes are counted, pairs lock when right. */
export function MatchStep({ ids, dict, onAnswer }: { ids: string[]; dict: Dict; onAnswer: Answer }) {
  const right = useMemo(() => [...ids].sort(() => Math.random() - 0.5), [ids])
  const [sel, setSel] = useState<string>()
  const [done, setDone] = useState<string[]>([])
  const [flash, setFlash] = useState<string>()
  const [missed, setMissed] = useState<string[]>([])

  const tapRight = (id: string) => {
    if (!sel || done.includes(id)) return
    if (id === sel) {
      const next = [...done, id]
      setDone(next)
      setSel(undefined)
      if (next.length === ids.length) onAnswer(true, undefined, missed)
    } else {
      if (!missed.includes(sel)) setMissed([...missed, sel])
      setFlash(id)
      setTimeout(() => setFlash(undefined), 450)
    }
  }

  return (
    <div className="step">
      <h2 className="prompt">{t.prompts.match}</h2>
      <div className="match">
        <div className="match__col">
          {ids.map((id) => (
            <button
              key={id}
              className={`option${done.includes(id) ? ' is-done' : sel === id ? ' is-selected' : ''}`}
              disabled={done.includes(id)}
              onClick={() => setSel(id)}
            >
              <Lu>{dict.get(id)?.word}</Lu>
            </button>
          ))}
        </div>
        <div className="match__col">
          {right.map((id) => (
            <button
              key={id}
              className={`option${done.includes(id) ? ' is-done' : flash === id ? ' is-wrong' : ''}`}
              disabled={done.includes(id)}
              onClick={() => tapRight(id)}
            >
              {dict.get(id)?.translations.ar}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
