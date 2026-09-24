/**
 * Content gate. Fails when content marked as publishable is not LOD-verified,
 * or when a Luxembourgish field contains a German-only form.
 * Unverified vocabulary is reported but allowed (it stays out of the app).
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isPublishable, type Lesson, type VocabularyEntry } from '@whatslux/shared'
import { detectGermanInLuxembourgish } from '@whatslux/ai'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const errors: string[] = []
const pending: string[] = []

const readJsonDir = <T>(dir: string): Array<{ file: string; data: T }> =>
  existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => ({ file: path.join(dir, f), data: JSON.parse(readFileSync(path.join(dir, f), 'utf8')) as T }))
    : []

const checkLu = (where: string, text: string | undefined) => {
  if (!text) return
  for (const s of detectGermanInLuxembourgish(text).suspects)
    errors.push(`${where}: German form "${s.word}" (Luxembourgish: ${s.luxembourgish}) in "${text}"`)
}

const vocab = new Map<string, VocabularyEntry>()
for (const { file, data } of readJsonDir<VocabularyEntry[]>(path.join(root, 'vocabulary'))) {
  for (const v of data) {
    if (vocab.has(v.id)) errors.push(`${file}: duplicate id ${v.id}`)
    vocab.set(v.id, v)
    checkLu(`${v.id}.word`, v.word)
    checkLu(`${v.id}.exampleLu`, v.exampleLu)
    if (v.lod.verified && !isPublishable(v)) errors.push(`${v.id}: verified=true needs verifiedBy and verifiedAt`)
    if (!v.lod.verified) pending.push(`${v.id} (${v.article ? v.article + ' ' : ''}${v.word})${v.reviewNote ? ' — ' + v.reviewNote : ''}`)
  }
}

for (const level of ['a1', 'a2', 'b1']) {
  for (const { file, data: lesson } of readJsonDir<Lesson>(path.join(root, 'lessons', level))) {
    checkLu(`${lesson.slug}.titleLu`, lesson.titleLu)
    for (const [i, s] of lesson.sections.entries()) {
      for (const [j, e] of (s.examples ?? []).entries()) checkLu(`${lesson.slug}.sections[${i}].examples[${j}]`, e.lu)
      checkLu(`${lesson.slug}.sections[${i}].correct`, s.correct)
      checkLu(`${lesson.slug}.sections[${i}].luxembourgish`, s.luxembourgish)
    }
    for (const id of lesson.vocabularyIds) {
      const v = vocab.get(id)
      if (!v) errors.push(`${file}: unknown vocabulary id ${id}`)
      else if (lesson.review.lodVerified && !isPublishable(v)) errors.push(`${file}: marked verified but uses unverified word ${id}`)
    }
  }
}

console.log(`Vocabulary: ${vocab.size} entries, ${vocab.size - pending.length} LOD-verified`)
if (pending.length) console.log(`\nAwaiting LOD verification (${pending.length}):\n  - ${pending.join('\n  - ')}`)
if (errors.length) {
  console.error(`\n${errors.length} error(s):\n  - ${errors.join('\n  - ')}`)
  process.exit(1)
}
console.log('\nContent OK')
