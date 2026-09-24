import type Anthropic from '@anthropic-ai/sdk'
import type { Localized, UILanguage } from '@whatslux/shared'
import { MODEL, getClient } from '../clients/anthropic.js'
import { buildSystemPrompt } from '../prompts/system-prompts.js'
import { reviewLuxembourgish, type AIReview } from './review.js'

export type Scenario =
  | 'JOB_INTERVIEW' | 'DOCTOR_APPOINTMENT' | 'COMMUNE_OFFICE' | 'SHOPPING'
  | 'NEIGHBOR_CHAT' | 'SCHOOL_MEETING' | 'BANK' | 'RESTAURANT'

export interface ScenarioContext {
  titles: Localized
  /** Who the AI plays, described in English for the model. */
  aiRole: string
  /**
   * Model phrases shown to the learner. Must be reviewed on lod.lu by a human
   * before `phrasesVerified` is set — until then the UI must not present them
   * as reference answers.
   */
  keyPhrases: string[]
  phrasesVerified: boolean
}

export const SCENARIOS: Partial<Record<Scenario, ScenarioContext>> = {
  COMMUNE_OFFICE: {
    titles: { ar: 'في مكتب البلدية', fr: 'À la commune', ru: 'В коммуне', en: 'At the commune office', pt: 'Na câmara municipal' },
    aiRole: 'a friendly clerk at a Luxembourg commune office',
    keyPhrases: [
      'Ech hätt gär eng Informatioun iwwer …',
      'Wou kann ech de Formulaire kréien?',
    ],
    phrasesVerified: false,
  },
}

export async function continueConversation(params: {
  scenario: Scenario
  level: 'A1' | 'A2' | 'B1'
  language: UILanguage
  history: Anthropic.MessageParam[]
}): Promise<{ reply: string; review: AIReview }> {
  const ctx = SCENARIOS[params.scenario]
  if (!ctx) throw new Error(`Scenario ${params.scenario} is not configured yet`)

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: `${buildSystemPrompt('Role-play partner', params.language)}

You play ${ctx.aiRole}. Speak ONLY Luxembourgish in character, at CEFR ${params.level}:
short sentences, everyday words, one question at a time.
If the learner is stuck, add one short hint in the interface language (${params.language}) in square brackets.`,
    messages: params.history,
  })

  const reply = response.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('\n')
  // Strip bracketed hints (interface language) before scanning the Luxembourgish.
  const review = reviewLuxembourgish({ reply: reply.replace(/\[[^\]]*\]/g, '') }, params.language)
  return { reply, review }
}
