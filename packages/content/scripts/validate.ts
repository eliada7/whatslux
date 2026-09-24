/**
 * Content gate. Fails when content marked as publishable is not LOD-verified,
 * or when a Luxembourgish field contains a German-only form.
 * Unverified vocabulary is reported but allowed (it stays out of the app).
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isPublishable, type Lesson, type VocabularyEntry } from '@whatslux/shared'
import { GERMAN_ONLY_FORMS, detectGermanInLuxembourgish } from '@whatslux/ai'
import { LodIndex } from '@whatslux/lod'

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

// ── Checks against the imported LOD dataset (skipped when not imported) ──
if (LodIndex.exists()) {
  const lod = await LodIndex.load()
  for (const v of vocab.values()) {
    if (!v.lod.entryId) continue
    const e = lod.byId(v.lod.entryId)
    if (!e) errors.push(`${v.id}: LOD entry ${v.lod.entryId} does not exist`)
    else if (e.lemma !== v.word) errors.push(`${v.id}: "${v.word}" does not match LOD lemma "${e.lemma}"`)
  }
  // Every Luxembourgish form LOD knows (lemmas, plurals, participles, example words)
  const luForms = new Set<string>()
  for (const e of lod.all()) {
    luForms.add(e.lemma)
    e.plural?.forEach((p) => luForms.add(p.form))
    e.pastParticiple?.forEach((p) => luForms.add(p))
    for (const m of e.meanings) for (const ex of m.examples) for (const w of ex.text.split(/[\s']+/)) luForms.add(w.replace(/[^\p{L}-]/gu, ''))
  }
  const lower = new Set([...luForms].map((f) => f.toLowerCase()))
  for (const f of GERMAN_ONLY_FORMS) {
    const clash = f.caseSensitive ? luForms.has(f.de) : lower.has(f.de.toLowerCase())
    if (clash) errors.push(`German detector: "${f.de}" is a valid Luxembourgish form in LOD — remove it from GERMAN_ONLY_FORMS`)
  }
  console.log(`LOD: checked against ${lod.size} entries (${lod.meta?.source ?? 'unknown release'})`)
} else {
  console.log('LOD: dataset not imported — run `pnpm lod:import <zip>` for full checks')
}

console.log(`Vocabulary: ${vocab.size} entries, ${vocab.size - pending.length} LOD-verified`)
if (pending.length) console.log(`\nAwaiting LOD verification (${pending.length}):\n  - ${pending.join('\n  - ')}`)
if (errors.length) {
  console.error(`\n${errors.length} error(s):\n  - ${errors.join('\n  - ')}`)
  process.exit(1)
}
console.log('\nContent OK')
