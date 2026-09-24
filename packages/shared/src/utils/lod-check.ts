import type { VocabularyEntry } from '../types/vocabulary.js'

export function isPublishable(entry: Pick<VocabularyEntry, 'lod'>): boolean {
  return entry.lod.verified && Boolean(entry.lod.verifiedBy) && Boolean(entry.lod.verifiedAt)
}
