import { OFFICIAL_REFERENCES } from '../constants/references.js'
import type { VocabularyEntry } from '../types/vocabulary.js'

/** Search link a learner or reviewer can open to check a word on LOD. */
export function lodSearchUrl(word: string): string {
  // URL shape taken from the product spec; confirm against lod.lu before release.
  return `${OFFICIAL_REFERENCES.lod}search?q=${encodeURIComponent(word)}`
}

export function isPublishable(entry: Pick<VocabularyEntry, 'lod'>): boolean {
  return entry.lod.verified && Boolean(entry.lod.verifiedBy) && Boolean(entry.lod.verifiedAt)
}
