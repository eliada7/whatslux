import type { CEFRLevel } from '../constants/levels.js'
import type { PartialLocalized } from './i18n.js'

export type VocabularyCategory =
  | 'CORE' | 'WORK' | 'HEALTHCARE' | 'ADMINISTRATION' | 'HOUSING' | 'TRANSPORT'
  | 'FAMILY' | 'FOOD' | 'SHOPPING' | 'TIME' | 'WEATHER' | 'NUMBERS'
  | 'EMOTIONS' | 'EDUCATION' | 'TECHNOLOGY' | 'CULTURE'

/**
 * One vocabulary entry. The Luxembourgish fields are stored exactly as a human
 * reviewer confirmed them on lod.lu — never auto-corrected or generated.
 */
export interface VocabularyEntry {
  id: string
  word: string
  /** den / de / d' / eng … as it appears before this word */
  article?: string
  plural?: string
  translations: PartialLocalized
  exampleLu?: string
  exampleTranslations?: PartialLocalized
  category: VocabularyCategory
  level: CEFRLevel
  lod: LodVerification
  /** Free-text notes for the reviewer (e.g. "source spec had d'Formulaire — check gender"). */
  reviewNote?: string
}

export interface LodVerification {
  verified: boolean
  /** Direct link to the LOD entry once verified. */
  url?: string
  verifiedBy?: string
  /** ISO date */
  verifiedAt?: string
}
