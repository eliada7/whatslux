import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isPublishable, type VocabularyEntry } from '@whatslux/shared'

const VOCAB_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../packages/content/vocabulary')

/** Reads vocabulary from the content package. Swap for Prisma once the DB is provisioned. */
export function loadVocabulary(dir = VOCAB_DIR): VocabularyEntry[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => JSON.parse(readFileSync(path.join(dir, f), 'utf8')) as VocabularyEntry[])
}

/** Learners only ever see LOD-verified words. */
export const publishedVocabulary = (all: VocabularyEntry[]) => all.filter(isPublishable)
