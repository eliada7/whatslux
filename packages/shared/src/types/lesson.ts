import type { CEFRLevel } from '../constants/levels.js'
import type { PartialLocalized } from './i18n.js'

export type SectionType =
  | 'LEARNING_OBJECTIVES' | 'GRAMMAR_RULE' | 'VOCABULARY_TABLE' | 'EXAMPLES'
  | 'COMMON_ERRORS' | 'MEMORY_TRICK' | 'NATIVE_LANGUAGE_NOTE' | 'LU_VS_DE_WARNING'
  | 'EXAM_TIP' | 'CULTURE_NOTE' | 'QUICK_REVIEW'

export interface LuExample {
  lu: string
  translations: PartialLocalized
  literal?: PartialLocalized
}

export interface LessonSection {
  type: SectionType
  title?: PartialLocalized
  body?: PartialLocalized
  formula?: string
  examples?: LuExample[]
  /** For LU_VS_DE_WARNING */
  german?: string
  luxembourgish?: string
  /** For COMMON_ERRORS */
  wrong?: string
  correct?: string
}

export interface Lesson {
  slug: string
  titleLu: string
  titles: PartialLocalized
  level: CEFRLevel
  order: number
  estimatedMinutes: number
  isPremium: boolean
  sections: LessonSection[]
  vocabularyIds: string[]
  review: {
    lodVerified: boolean
    verifiedBy?: string
    verifiedAt?: string
  }
}
