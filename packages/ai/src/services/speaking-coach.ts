import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import type { UILanguage } from '@whatslux/shared'
import { z } from 'zod'
import { MODEL, getClient } from '../clients/anthropic.js'
import { buildSystemPrompt } from '../prompts/system-prompts.js'
import { reviewLuxembourgish, type AIReview } from './review.js'

// 0–100; ranges are stated in the prompt and clamped after parsing
const score = z.number().int()

export const SpeakingFeedbackSchema = z.object({
  overallScore: score,
  passStatus: z.enum(['PASS', 'ALMOST', 'NEEDS_WORK']),
  scores: z.object({ fluency: score, vocabulary: score, grammar: score }),
  corrections: z.array(
    z.object({
      original: z.string(),
      corrected: z.string(),
      explanation: z.string(),
      /** The learner used German instead of Luxembourgish. */
      isGermanMistake: z.boolean(),
    }),
  ),
  strongPoints: z.array(z.string()),
  improvementAreas: z.array(z.string()),
  encouragement: z.string(),
  nextStep: z.string(),
})
export type SpeakingFeedback = z.infer<typeof SpeakingFeedbackSchema>

/**
 * Scores a transcribed answer. Pronunciation is not scored: the input is a
 * transcript, so the model cannot hear the learner.
 */
export async function evaluateSpeaking(params: {
  transcription: string
  prompt: string
  level: 'A2' | 'B1'
  topic: string
  language: UILanguage
  isExamMode?: boolean
}): Promise<{ feedback: SpeakingFeedback; review: AIReview }> {
  const response = await getClient().messages.parse({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    system: buildSystemPrompt('Speaking coach (Sproochentest preparation)', params.language),
    messages: [
      {
        role: 'user',
        content: `Evaluate this spoken answer (speech-to-text transcript) at CEFR ${params.level}.
Write explanations, encouragement and next step in the interface language (${params.language}).
${params.isExamMode ? 'Exam mode: score strictly, as an examiner would.' : 'Practice mode: be encouraging, but honest.'}

<topic>${params.topic}</topic>
<question>${params.prompt}</question>
<transcript>${params.transcription}</transcript>

All scores are integers from 0 to 100.
Mark isGermanMistake when the learner used a German form instead of the Luxembourgish one.
Transcripts contain speech-recognition errors — do not penalise obvious transcription noise.`,
      },
    ],
    output_config: { format: zodOutputFormat(SpeakingFeedbackSchema) },
  })

  const parsed = response.parsed_output
  if (!parsed) throw new Error(`Speaking coach returned no parseable output (stop_reason: ${response.stop_reason})`)
  const clamp = (n: number) => Math.min(100, Math.max(0, n))
  const feedback: SpeakingFeedback = {
    ...parsed,
    overallScore: clamp(parsed.overallScore),
    scores: { fluency: clamp(parsed.scores.fluency), vocabulary: clamp(parsed.scores.vocabulary), grammar: clamp(parsed.scores.grammar) },
  }

  const review = reviewLuxembourgish(
    Object.fromEntries(feedback.corrections.map((c, i) => [`corrections[${i}].corrected`, c.corrected])),
    params.language,
  )
  return { feedback, review }
}
