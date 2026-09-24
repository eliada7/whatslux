import type { UILanguage } from '@whatslux/shared'
import { detectGermanInLuxembourgish, type GermanSuspect } from '../prompts/anti-confusion.js'
import { VERIFY_DISCLAIMER } from '../prompts/system-prompts.js'

/** Metadata attached to every AI response that contains Luxembourgish. */
export interface AIReview {
  aiGenerated: true
  disclaimer: string
  /** True when German-only forms were found in the Luxembourgish fields. */
  needsHumanReview: boolean
  germanSuspects: Array<GermanSuspect & { field: string }>
}

export function reviewLuxembourgish(fields: Record<string, string | undefined>, language: UILanguage): AIReview {
  const germanSuspects: AIReview['germanSuspects'] = []
  for (const [field, text] of Object.entries(fields)) {
    if (!text) continue
    for (const s of detectGermanInLuxembourgish(text).suspects) germanSuspects.push({ ...s, field })
  }
  return {
    aiGenerated: true,
    disclaimer: VERIFY_DISCLAIMER[language],
    needsHumanReview: germanSuspects.length > 0,
    germanSuspects,
  }
}
