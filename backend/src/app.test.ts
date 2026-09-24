import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { LodIndex } from '@whatslux/lod'
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
  const lod = new LodIndex([
    { id: 'DOKTER1', lemma: 'Dokter', pos: 'SUBST', gender: 'M', meanings: [] },
    {
      id: 'WEINI1', lemma: 'wéini', pos: 'ADV',
      meanings: [{
        id: 'WEINI1UNI1', translations: { en: ['when'] },
        examples: [
          { id: 'abc123', text: 'wéini kënns du?' },
          { text: 'rude example', register: ['VULG'] },
        ],
      }],
    },
  ])
  return { app: createApp({ ai, vocabulary: () => [verified, unverified], lod: async () => lod }), ai }
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

  it('searches LOD with article and audio', async () => {
    const res = await request(makeApp().app).get('/api/v1/lod/search').query({ q: 'dok' })
    expect(res.body.items[0]).toMatchObject({
      id: 'DOKTER1',
      article: 'den',
      audio: { aac: 'https://lod.lu/uploads/AAC/dokter1.m4a' },
    })
  })

  it('returns a LOD entry, 404 for unknown ids', async () => {
    const { app } = makeApp()
    const res = await request(app).get('/api/v1/lod/entry/WEINI1')
    expect(res.body.lemma).toBe('wéini')
    expect(res.body.meanings[0].examples).toEqual([
      { id: 'abc123', text: 'wéini kënns du?', audio: { aac: 'https://lod.lu/uploads/examples/AAC/ab/abc123.m4a', ogg: 'https://lod.lu/uploads/examples/OGG/ab/abc123.ogg' } },
    ])
    expect((await request(app).get('/api/v1/lod/entry/NOPE1')).status).toBe(404)
  })

  it('loads the content package vocabulary', () => {
    expect(loadVocabulary().length).toBeGreaterThan(0)
  })
})
