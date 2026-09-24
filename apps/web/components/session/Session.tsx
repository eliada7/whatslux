'use client'

import { calculateNextReview, type VocabularyEntry } from '@whatslux/shared'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArticleStep, IntroStep, ListenStep, MatchStep, MeaningStep } from './Steps'
import { buildLesson, buildReview, wordsOf, type Step } from '@/lib/exercises'
import { t } from '@/lib/i18n'
import { cardOf, loadCards, saveCards } from '@/lib/srs-store'

type Feedback = { correct: boolean; correction?: React.ReactNode; praise: string }

export function Session({ entries, mode }: { entries: VocabularyEntry[]; mode: 'learn' | 'review' }) {
  const dict = useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries])
  const [queue, setQueue] = useState<Step[] | null>(null)
  const [done, setDone] = useState(0)
  const [feedback, setFeedback] = useState<Feedback>()
  const [mistakes, setMistakes] = useState<Record<string, number>>({})
  const [answers, setAnswers] = useState({ right: 0, total: 0 })
  const [finished, setFinished] = useState(false)
  // Bumped on every step so a repeated step always gets a fresh screen.
  const [turn, setTurn] = useState(0)

  useEffect(() => {
    const cards = loadCards()
    setQueue(mode === 'learn' ? buildLesson(entries, cards) : buildReview(entries, cards))
  }, [entries, mode])

  if (!queue) return null
  const step = queue[0]
  const total = done + queue.length

  // Save SM-2 results: a word answered without mistakes is "good" (4), otherwise "failed" (2).
  const finish = (m: Record<string, number>) => {
    const cards = loadCards()
    const practised = new Set(Object.keys(m))
    for (const id of practised) {
      const next = calculateNextReview(cardOf(cards, id), m[id] ? 2 : 4)
      cards[id] = { ...next, nextReviewAt: next.nextReviewAt.toISOString() }
    }
    saveCards(cards)
    setFinished(true)
  }

  const onAnswer = (correct: boolean, correction?: React.ReactNode, missed: string[] = []) => {
    const ids = wordsOf(step)
    setMistakes((m) => {
      const n = { ...m }
      for (const id of ids) n[id] = (n[id] ?? 0) + (!correct || missed.includes(id) ? 1 : 0)
      return n
    })
    setAnswers((a) => ({ right: a.right + (correct ? 1 : 0), total: a.total + 1 }))
    setFeedback({ correct, correction, praise: t.correct[Math.floor(Math.random() * t.correct.length)] })
  }

  const next = () => {
    const wrong = feedback && !feedback.correct
    const rest = queue.slice(1)
    // Busuu repeats a missed exercise at the end of the lesson.
    const q = wrong ? [...rest, step] : rest
    setFeedback(undefined)
    setTurn((n) => n + 1)
    if (!wrong) setDone((d) => d + 1)
    if (!q.length) finish(mistakes)
    setQueue(q)
  }

  if (finished || !step) {
    const nothing = !finished && !step
    return (
      <div className="session session--done">
        {nothing ? (
          <p className="empty">{t.nothingToDo}</p>
        ) : (
          <div className="done">
            <h2>{mode === 'learn' ? t.lessonDone : t.reviewDone}</h2>
            <div className="stats">
              <div>
                <strong>{Object.keys(mistakes).length}</strong>
                <span>{t.statWords}</span>
              </div>
              <div>
                <strong>{answers.total ? Math.round((100 * answers.right) / answers.total) : 100}%</strong>
                <span>{t.statAccuracy}</span>
              </div>
            </div>
          </div>
        )}
        <Link href="/" className="btn-primary btn-block">
          {t.backHome}
        </Link>
      </div>
    )
  }

  const v = step.kind === 'match' ? undefined : dict.get(step.id)
  const key = `turn-${turn}`

  return (
    <div className="session">
      <header className="session__top">
        <Link href="/" className="close" aria-label={t.close}>
          ✕
        </Link>
        <div className="bar" role="progressbar" aria-valuenow={done} aria-valuemax={total}>
          <div className="bar__fill" style={{ width: `${(100 * done) / total}%` }} />
        </div>
      </header>

      <main className="session__body" key={key}>
        {step.kind === 'intro' && v && <IntroStep v={v} />}
        {step.kind === 'meaning' && v && <MeaningStep v={v} options={step.options} dict={dict} onAnswer={onAnswer} />}
        {step.kind === 'listen' && v && <ListenStep v={v} options={step.options} dict={dict} onAnswer={onAnswer} />}
        {step.kind === 'article' && v && <ArticleStep v={v} options={step.options} onAnswer={onAnswer} />}
        {step.kind === 'match' && <MatchStep ids={step.ids} dict={dict} onAnswer={onAnswer} />}
      </main>

      <footer className={`session__foot${feedback ? (feedback.correct ? ' is-correct' : ' is-wrong') : ''}`}>
        {feedback && (
          <div className="feedback" role="status">
            <strong>{feedback.correct ? `✅ ${feedback.praise}` : `❌ ${t.wrong}`}</strong>
            {!feedback.correct && (
              <>
                <div className="feedback__fix">{feedback.correction}</div>
                <small>{t.willRepeat}</small>
              </>
            )}
          </div>
        )}
        {(step.kind === 'intro' || feedback) && (
          <button className="btn-primary btn-block" onClick={next} autoFocus>
            {t.continue}
          </button>
        )}
      </footer>
    </div>
  )
}
