/**
 * Fills vocabulary entries from the imported LOD dataset.
 *
 * For every entry with `lod.entryId`: checks the spelling against the LOD lemma,
 * sets the article (from LOD gender + n-rule), plural, audio and link, and marks
 * the entry as verified by the dataset. Prints LOD's French/English meanings next
 * to our Arabic so a teacher can review the translation.
 *
 *   pnpm --filter @whatslux/content sync-lod
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LodIndex, definiteArticle, lodArticleUrl, lodWordAudio } from '@whatslux/lod'
import type { VocabularyEntry } from '@whatslux/shared'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'vocabulary')
const lod = await LodIndex.load()
const release = lod.meta?.source.match(/(\d{6})/)?.[1] ?? 'unknown'
const verifiedAt = lod.meta?.importedAt.slice(0, 10)
let problems = 0

for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const entries = JSON.parse(readFileSync(path.join(dir, file), 'utf8')) as VocabularyEntry[]
  for (const v of entries) {
    const id = v.lod.entryId
    if (!id) {
      const candidates = lod.byLemma(v.word).map((e) => `${e.id} (${e.pos}${e.gender ? ' ' + e.gender : ''})`)
      console.log(`· ${v.id}: no entryId${candidates.length ? ` — candidates: ${candidates.join(', ')}` : ' — not in LOD'}`)
      continue
    }
    const e = lod.byId(id)
    if (!e) {
      console.error(`✗ ${v.id}: LOD entry ${id} not found`)
      problems++
      continue
    }
    if (e.lemma !== v.word) {
      console.error(`✗ ${v.id}: spelling "${v.word}" ≠ LOD "${e.lemma}"`)
      problems++
      continue
    }
    const article = definiteArticle(e.gender, e.lemma)
    if (e.pos === 'SUBST' && !article && !v.article) {
      console.error(`✗ ${v.id}: LOD gender "${e.gender}" allows more than one article — set "article" by hand`)
      problems++
      continue
    }
    if (article) v.article = article
    const plural = e.plural?.[0]?.form
    if (plural) v.plural = plural
    v.lod = {
      verified: true,
      entryId: id,
      url: lodArticleUrl(id),
      audio: lodWordAudio(id),
      verifiedBy: `LOD open data (${release})`,
      verifiedAt,
    }
    const fr = e.meanings.flatMap((m) => m.translations.fr ?? []).slice(0, 3).join(', ')
    const en = e.meanings.flatMap((m) => m.translations.en ?? []).slice(0, 3).join(', ')
    console.log(`✓ ${v.article ? (v.article.endsWith("'") ? v.article : v.article + ' ') : ''}${v.word}${plural ? ` (pl. ${plural})` : ''}  ar: ${v.translations.ar ?? '—'}  |  LOD fr: ${fr}  en: ${en}`)
  }
  writeFileSync(path.join(dir, file), JSON.stringify(entries, null, 2) + '\n')
}
if (problems) process.exit(1)
