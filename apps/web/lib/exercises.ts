import type { VocabularyEntry } from '@whatslux/shared'
import { strengthOf } from './strength'
import type { StoredCard } from './srs-store'

/**
 * Busuu-style session steps. Everything is generated from LOD-verified data —
 * no AI-written Luxembourgish.
 */
export type Step =
  | { kind: 'intro'; id: string }
  | { kind: 'meaning'; id: string; options: string[] } // see Luxembourgish → pick Arabic
  | { kind: 'listen'; id: string; options: string[] } // hear audio → pick Luxembourgish
  | { kind: 'article'; id: string; options: string[] } // ___ Dokter → den / de / d'
  | { kind: 'match'; ids: string[] } // pair Luxembourgish ↔ Arabic

export const LESSON_SIZE = 5
export const REVIEW_SIZE = 10
const ARTICLES = ['den', 'de', "d'"]

type Rng = () => number
export function shuffle<T>(xs: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const hasSingleGenderArticle = (v: VocabularyEntry) => !!v.article && v.gender?.length === 1
const canListen = (v: VocabularyEntry) => !!v.lod.audio

/** Correct id + up to 3 distractors whose Arabic meaning differs. */
function optionsFor(v: VocabularyEntry, pool: VocabularyEntry[], rng: Rng): string[] {
  const others = shuffle(
    pool.filter((o) => o.id !== v.id && o.translations.ar !== v.translations.ar),
    rng,
  ).slice(0, 3)
  return shuffle([v.id, ...others.map((o) => o.id)], rng)
}

/** One or two practice steps for a word, varied by what the data supports. */
function practiceFor(v: VocabularyEntry, pool: VocabularyEntry[], rng: Rng): Step[] {
  const steps: Step[] = [{ kind: 'meaning', id: v.id, options: optionsFor(v, pool, rng) }]
  const extra: Step[] = []
  if (canListen(v)) extra.push({ kind: 'listen', id: v.id, options: optionsFor(v, pool, rng) })
  if (hasSingleGenderArticle(v)) extra.push({ kind: 'article', id: v.id, options: ARTICLES })
  if (extra.length) steps.push(shuffle(extra, rng)[0])
  return steps
}

/** New words: present each one, then practise all of them mixed, then match pairs. */
export function buildLesson(all: VocabularyEntry[], cards: Record<string, StoredCard>, rng: Rng = Math.random): Step[] {
  const fresh = all.filter((v) => !cards[v.id]).slice(0, LESSON_SIZE)
  if (!fresh.length) return []
  const intros: Step[] = fresh.map((v) => ({ kind: 'intro', id: v.id }))
  const practice = shuffle(fresh.flatMap((v) => practiceFor(v, all, rng)), rng)
  const match: Step[] = fresh.length >= 3 ? [{ kind: 'match', ids: shuffle(fresh.map((v) => v.id), rng).slice(0, 4) }] : []
  return [...intros, ...practice, ...match]
}

/** Smart Review: due and weak words first, practice only. */
export function buildReview(all: VocabularyEntry[], cards: Record<string, StoredCard>, rng: Rng = Math.random, now = new Date()): Step[] {
  const learned = all.filter((v) => cards[v.id])
  const byNeed = [...learned].sort(
    (a, b) =>
      strengthOf(cards[a.id], now) - strengthOf(cards[b.id], now) ||
      new Date(cards[a.id].nextReviewAt).getTime() - new Date(cards[b.id].nextReviewAt).getTime(),
  )
  const words = byNeed.slice(0, REVIEW_SIZE)
  if (!words.length) return []
  const practice = shuffle(words.flatMap((v) => practiceFor(v, all, rng)), rng)
  const match: Step[] = words.length >= 3 ? [{ kind: 'match', ids: shuffle(words.map((v) => v.id), rng).slice(0, 4) }] : []
  return [...practice, ...match]
}

/** Words a step practises (intro counts as none). */
export const wordsOf = (s: Step): string[] => (s.kind === 'intro' ? [] : s.kind === 'match' ? s.ids : [s.id])
