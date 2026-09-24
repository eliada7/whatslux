import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import type { UILanguage } from '@whatslux/shared'
import { z } from 'zod'
import { MODEL, getClient } from '../clients/anthropic.js'
import { buildSystemPrompt } from '../prompts/system-prompts.js'
import { reviewLuxembourgish, type AIReview } from './review.js'

export const GrammarExplanationSchema = z.object({
  ruleTitle: z.string(),
  simpleExplanation: z.string(),
  formula: z.string(),
  examples: z.array(
    z.object({
      luxembourgish: z.string(),
      translation: z.string(),
      literal: z.string().nullable(),
    }),
  ),
  luVsDeWarning: z
    .object({ germanVersion: z.string(), luxembourgishVersion: z.string(), explanation: z.string() })
    .nullable(),
  commonError: z.object({ wrong: z.string(), correct: z.string(), explanation: z.string() }),
  memoryTrick: z.string(),
  /** Set when the model is unsure of any Luxembourgish form it wrote. */
  uncertainForms: z.array(z.string()),
})
export type GrammarExplanation = z.infer<typeof GrammarExplanationSchema>

export async function explainGrammarError(params: {
  userSentence: string
  correctSentence: string
  errorType: string
  language: UILanguage
  includeLuDeComparison?: boolean
}): Promise<{ explanation: GrammarExplanation; review: AIReview }> {
  const { language, includeLuDeComparison } = params

  const response = await getClient().messages.parse({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    system: buildSystemPrompt('Grammar explainer', language),
    messages: [
      {
        role: 'user',
        content: `A learner made a mistake in Luxembourgish. Explain it in the interface language (${language}).

<learner_sentence>${params.userSentence}</learner_sentence>
<correct_sentence>${params.correctSentence}</correct_sentence>
<error_type>${params.errorType}</error_type>

Keep it short: one rule, 1–3 everyday examples (work, family, commune, doctor, shopping…).
${includeLuDeComparison ? 'Fill luVsDeWarning with the German form and why it is wrong here.' : 'Set luVsDeWarning to null unless German interference caused this error.'}
List in uncertainForms any Luxembourgish form you wrote but are not fully sure of.`,
      },
    ],
    output_config: { format: zodOutputFormat(GrammarExplanationSchema) },
  })

  const explanation = response.parsed_output
  if (!explanation) throw new Error(`Grammar explainer returned no parseable output (stop_reason: ${response.stop_reason})`)

  const review = reviewLuxembourgish(
    Object.fromEntries([
      ...explanation.examples.map((e, i) => [`examples[${i}].luxembourgish`, e.luxembourgish]),
      ['commonError.correct', explanation.commonError.correct],
      ['luVsDeWarning.luxembourgishVersion', explanation.luVsDeWarning?.luxembourgishVersion],
    ]),
    language,
  )
  if (explanation.uncertainForms.length > 0) review.needsHumanReview = true

  return { explanation, review }
}
