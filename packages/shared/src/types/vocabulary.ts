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
  /** Noun gender from LOD: M, F, N (or combinations) */
  gender?: string
  translations: PartialLocalized
  exampleLu?: string
  exampleTranslations?: PartialLocalized
  /** Audio of exampleLu when the sentence comes from a recorded LOD example */
  exampleAudio?: { aac: string; ogg: string }
  /** Where exampleLu comes from: the teacher, or LOD (untranslated) */
  exampleSource?: 'teacher' | 'lod'
  category: VocabularyCategory
  level: CEFRLevel
  lod: LodVerification
  /** Free-text notes for the reviewer (e.g. "source spec had d'Formulaire — check gender"). */
  reviewNote?: string
}

export interface LodVerification {
  verified: boolean
  /** LOD article id, e.g. "DOKTER1" — the link between this word and the dictionary */
  entryId?: string
  /** Pronunciation audio from lod.lu */
  audio?: { aac: string; ogg: string }
  /** Direct link to the LOD entry once verified. */
  url?: string
  /** A person's name, or "LOD open data (<release>)" when checked against the dataset */
  verifiedBy?: string
  /** ISO date */
  verifiedAt?: string
}
