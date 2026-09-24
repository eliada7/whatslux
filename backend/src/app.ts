import express, { type ErrorRequestHandler } from 'express'
import * as ai from '@whatslux/ai'
import { LodIndex, definiteArticle, isLearnerSafe, lodArticleUrl, lodExampleAudio, lodWordAudio, type LodEntry } from '@whatslux/lod'
import { UI_LANGUAGES, calculateNextReview, mapRatingToQuality, type VocabularyEntry } from '@whatslux/shared'
import { z } from 'zod'
import { loadVocabulary, publishedVocabulary } from './services/vocabulary.service.js'

export interface AppDeps {
  ai: Pick<typeof ai, 'explainGrammarError' | 'evaluateSpeaking' | 'continueConversation'>
  vocabulary: () => VocabularyEntry[]
  /** Resolves to undefined when the LOD dataset has not been imported. */
  lod: () => Promise<LodIndex | undefined>
}

let lodCache: Promise<LodIndex | undefined> | undefined
const loadLod = () => (lodCache ??= LodIndex.exists() ? LodIndex.load() : Promise.resolve(undefined))

const lodSummary = (e: LodEntry) => ({
  id: e.id,
  lemma: e.lemma,
  pos: e.pos,
  gender: e.gender,
  article: e.pos === 'SUBST' ? definiteArticle(e.gender, e.lemma) : undefined,
  url: lodArticleUrl(e.id),
  audio: lodWordAudio(e.id),
})

const lang = z.enum(UI_LANGUAGES)

export function createApp(deps: AppDeps = { ai, vocabulary: loadVocabulary, lod: loadLod }): express.Express {
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
  // Served from the imported LOD open-data dataset (pnpm lod:import).
  v1.get('/lod/search', async (req, res) => {
    const { q, exact } = z.object({ q: z.string().min(1).max(100), exact: z.enum(['true', 'false']).optional() }).parse(req.query)
    const lod = await deps.lod()
    if (!lod) {
      res.status(503).json({ error: 'LOD dataset not imported' })
      return
    }
    const hits = exact === 'true' ? lod.byLemma(q) : lod.search(q)
    res.json({ items: hits.map(lodSummary), release: lod.meta?.source })
  })

  v1.get('/lod/entry/:id', async (req, res) => {
    const lod = await deps.lod()
    if (!lod) {
      res.status(503).json({ error: 'LOD dataset not imported' })
      return
    }
    const e = lod.byId(req.params.id)
    if (!e) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    // Crude, pejorative and vulgar meanings/examples are withheld from learners.
    const meanings = e.meanings.filter(isLearnerSafe).map((m) => ({
      ...m,
      examples: m.examples.filter(isLearnerSafe).map((x) => ({ ...x, audio: x.id ? lodExampleAudio(x.id) : undefined })),
    }))
    res.json({ ...e, ...lodSummary(e), meanings })
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
