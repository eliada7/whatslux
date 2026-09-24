import type { VocabularyEntry } from '@whatslux/shared'
import { describe, expect, it } from 'vitest'
import { buildLesson, buildReview, type Step } from './exercises'
import { strengthOf } from './strength'

const word = (id: string, ar: string, extra: Partial<VocabularyEntry> = {}): VocabularyEntry => ({
  id, word: id, translations: { ar }, category: 'WORK', level: 'A1',
  lod: { verified: true, verifiedBy: 'x', verifiedAt: '2026-01-01', audio: { aac: 'a', ogg: 'o' } },
  ...extra,
})
const pool = [
  word('Dokter', 'الطبيب', { article: 'den', gender: 'M' }),
  word('Kontrakt', 'العقد', { article: 'de', gender: 'M' }),
  word('Ordonnance', 'الوصفة', { article: "d'", gender: 'F' }),
  word('Salaire', 'الراتب', { article: 'de', gender: 'M' }),
  word('ADEM', 'وكالة التشغيل', { article: "d'", lod: { verified: true } }), // no gender, no audio
  word('Congé', 'الإجازة', { article: 'de', gender: 'M' }),
]
let seed = 1
const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

describe('buildLesson', () => {
  const steps = buildLesson(pool, {}, rng)

  it('presents up to 5 new words before practising them', () => {
    const intros = steps.filter((s) => s.kind === 'intro')
    expect(intros).toHaveLength(5)
    expect(steps.slice(0, 5).every((s) => s.kind === 'intro')).toBe(true)
    expect(steps.at(-1)?.kind).toBe('match')
  })

  it('always includes the right answer among distinct options', () => {
    for (const s of steps) {
      if (s.kind === 'meaning' || s.kind === 'listen') {
        expect(s.options).toContain(s.id)
        expect(new Set(s.options).size).toBe(s.options.length)
      }
    }
  })

  it('only asks for the article when LOD gives one gender, and only plays audio that exists', () => {
    const adem = steps.filter((s): s is Exclude<Step, { kind: 'match' }> => s.kind !== 'match' && s.id === 'ADEM')
    expect(adem.some((s) => s.kind === 'article' || s.kind === 'listen')).toBe(false)
  })

  it('skips words already learned', () => {
    const cards = { Dokter: { easeFactor: 2.5, interval: 1, repetitions: 1, nextReviewAt: new Date().toISOString() } }
    expect(buildLesson(pool, cards, rng).some((s) => s.kind === 'intro' && s.id === 'Dokter')).toBe(false)
  })
})

describe('buildReview', () => {
  it('reviews weakest words first and never introduces', () => {
    const now = new Date('2026-06-01')
    const cards = {
      Dokter: { easeFactor: 2.5, interval: 10, repetitions: 4, nextReviewAt: '2026-06-05' }, // strong
      Kontrakt: { easeFactor: 2.5, interval: 1, repetitions: 0, nextReviewAt: '2026-06-02' }, // weak
    }
    expect(strengthOf(cards.Dokter, now)).toBe(3)
    expect(strengthOf(cards.Kontrakt, now)).toBe(1)
    const steps = buildReview(pool, cards, rng, now)
    expect(steps.some((s) => s.kind === 'intro')).toBe(false)
    expect(new Set(steps.flatMap((s) => (s.kind === 'match' ? s.ids : [s.id])))).toEqual(new Set(['Dokter', 'Kontrakt']))
  })
})
