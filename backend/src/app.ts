import express, { type ErrorRequestHandler } from 'express'
import * as ai from '@whatslux/ai'
import { UI_LANGUAGES, calculateNextReview, lodSearchUrl, mapRatingToQuality, type VocabularyEntry } from '@whatslux/shared'
import { z } from 'zod'
import { loadVocabulary, publishedVocabulary } from './services/vocabulary.service.js'

export interface AppDeps {
  ai: Pick<typeof ai, 'explainGrammarError' | 'evaluateSpeaking' | 'continueConversation'>
  vocabulary: () => VocabularyEntry[]
}

const lang = z.enum(UI_LANGUAGES)

export function createApp(deps: AppDeps = { ai, vocabulary: loadVocabulary }): express.Express {
  const app = express()
  app.use(express.json({ limit: '100kb' }))
  const v1 = express.Router()

  app.get('/health', (_req, res) => {
    res.json({ ok: true })
  })

  // ── Vocabulary ───────────────────────────────────────────────
  v1.get('/vocabulary', (req, res) => {
    const q = z.object({ category: z.string().optional(), level: z.string().optional() }).parse(req.query)
    const items = publishedVocabulary(deps.vocabulary()).filter(
      (v) => (!q.category || v.category === q.category) && (!q.level || v.level === q.level),
    )
    res.json({ items })
  })

  // Stateless SM-2 step until progress is persisted in Postgres.
  v1.post('/vocabulary/review/rate', (req, res) => {
    const body = z
      .object({
        card: z.object({ easeFactor: z.number().min(1.3), interval: z.number().int().min(0), repetitions: z.number().int().min(0) }),
        rating: z.enum(['AGAIN', 'HARD', 'OK', 'EASY']),
      })
      .parse(req.body)
    res.json(calculateNextReview(body.card, mapRatingToQuality(body.rating)))
  })

  // ── LOD ──────────────────────────────────────────────────────
  // lod.lu has no documented public API here yet; this returns the lookup link
  // for a human reviewer instead of pretending to verify automatically.
  v1.get('/lod/link', (req, res) => {
    const { word } = z.object({ word: z.string().min(1).max(100) }).parse(req.query)
    res.json({ word, url: lodSearchUrl(word) })
  })

  // ── AI ───────────────────────────────────────────────────────
  v1.post('/ai/grammar-explain', async (req, res) => {
    const body = z
      .object({
        userSentence: z.string().min(1).max(500),
        correctSentence: z.string().min(1).max(500),
        errorType: z.string().min(1).max(100),
        language: lang,
        includeLuDeComparison: z.boolean().optional(),
      })
      .parse(req.body)
    res.json(await deps.ai.explainGrammarError(body))
  })

  v1.post('/ai/evaluate-speaking', async (req, res) => {
    const body = z
      .object({
        transcription: z.string().min(1).max(5000),
        prompt: z.string().min(1).max(500),
        level: z.enum(['A2', 'B1']),
        topic: z.string().min(1).max(100),
        language: lang,
        isExamMode: z.boolean().optional(),
      })
      .parse(req.body)
    res.json(await deps.ai.evaluateSpeaking(body))
  })

  v1.post('/ai/conversation/continue', async (req, res) => {
    const body = z
      .object({
        scenario: z.enum(['JOB_INTERVIEW', 'DOCTOR_APPOINTMENT', 'COMMUNE_OFFICE', 'SHOPPING', 'NEIGHBOR_CHAT', 'SCHOOL_MEETING', 'BANK', 'RESTAURANT']),
        level: z.enum(['A1', 'A2', 'B1']),
        language: lang,
        history: z
          .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(2000) }))
          .min(1)
          .max(40),
      })
      .parse(req.body)
    res.json(await deps.ai.continueConversation(body))
  })

  app.use('/api/v1', v1)

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request', issues: err.issues })
      return
    }
    console.error(err)
    res.status(500).json({ error: 'Internal error' })
  }
  app.use(onError)
  return app
}
