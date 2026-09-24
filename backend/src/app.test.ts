import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import type { VocabularyEntry } from '@whatslux/shared'
import { createApp, type AppDeps } from './app.js'
import { loadVocabulary } from './services/vocabulary.service.js'

const verified: VocabularyEntry = {
  id: 'v1', word: 'Aarbecht', article: "d'", translations: { ar: 'العمل' }, category: 'WORK', level: 'A1',
  lod: { verified: true, verifiedBy: 'Teacher', verifiedAt: '2026-01-01' },
}
const unverified: VocabularyEntry = { ...verified, id: 'v2', word: 'Contrat', lod: { verified: false } }

function makeApp(overrides: Partial<AppDeps['ai']> = {}) {
  const ai = {
    explainGrammarError: vi.fn(),
    evaluateSpeaking: vi.fn(),
    continueConversation: vi.fn(),
    ...overrides,
  } as unknown as AppDeps['ai']
  return { app: createApp({ ai, vocabulary: () => [verified, unverified] }), ai }
}

describe('API', () => {
  it('serves only LOD-verified vocabulary', async () => {
    const res = await request(makeApp().app).get('/api/v1/vocabulary')
    expect(res.status).toBe(200)
    expect(res.body.items.map((v: VocabularyEntry) => v.id)).toEqual(['v1'])
  })

  it('rates a card with SM-2', async () => {
    const res = await request(makeApp().app)
      .post('/api/v1/vocabulary/review/rate')
      .send({ card: { easeFactor: 2.5, interval: 0, repetitions: 0 }, rating: 'OK' })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ interval: 1, repetitions: 1 })
  })

  it('rejects invalid input with 400', async () => {
    const res = await request(makeApp().app).post('/api/v1/ai/grammar-explain').send({ language: 'de' })
    expect(res.status).toBe(400)
  })

  it('passes grammar requests to the AI service', async () => {
    const explainGrammarError = vi.fn().mockResolvedValue({ explanation: {}, review: { aiGenerated: true } })
    const { app } = makeApp({ explainGrammarError })
    const body = { userSentence: 'Ich sinn midd', correctSentence: 'Ech sinn midd', errorType: 'pronoun', language: 'ar' }
    const res = await request(app).post('/api/v1/ai/grammar-explain').send(body)
    expect(res.status).toBe(200)
    expect(explainGrammarError).toHaveBeenCalledWith(body)
  })

  it('returns a LOD lookup link', async () => {
    const res = await request(makeApp().app).get('/api/v1/lod/link').query({ word: 'Moien' })
    expect(res.body.url).toContain('lod.lu')
  })

  it('loads the content package vocabulary', () => {
    expect(loadVocabulary().length).toBeGreaterThan(0)
  })
})
