/**
 * Imports the LOD open-data dump into data/lod-entries.jsonl.
 *
 *   pnpm lod:import /path/to/260727-new-lod-art.zip     (or the extracted .xml)
 *
 * Source: https://data.public.lu/en/datasets/letzebuerger-online-dictionnaire-lod-linguistesch-daten/
 */
import { createReadStream, createWriteStream, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import type { Readable } from 'node:stream'
import yauzl from 'yauzl'
import { DEFAULT_DATA_DIR, type LodMeta } from '../src/index-store.js'
import { parseLodXml } from '../src/parse.js'

function openXml(file: string): Promise<Readable> {
  if (!file.endsWith('.zip')) return Promise.resolve(createReadStream(file))
  return new Promise((resolve, reject) => {
    yauzl.open(file, { lazyEntries: true }, (err, zip) => {
      if (err || !zip) return reject(err)
      zip.on('entry', (entry: yauzl.Entry) => {
        if (!entry.fileName.endsWith('.xml')) return zip.readEntry()
        zip.openReadStream(entry, (e, stream) => (e || !stream ? reject(e) : resolve(stream)))
      })
      zip.on('end', () => reject(new Error(`No .xml file in ${file}`)))
      zip.readEntry()
    })
  })
}

const input = process.argv[2]
if (!input) {
  console.error('Usage: pnpm lod:import <LOD zip or xml>')
  process.exit(1)
}

mkdirSync(DEFAULT_DATA_DIR, { recursive: true })
const out = createWriteStream(path.join(DEFAULT_DATA_DIR, 'lod-entries.jsonl'))
const count = await parseLodXml(await openXml(path.resolve(input)), (e) => out.write(JSON.stringify(e) + '\n'))
await new Promise<void>((r) => out.end(r))

const meta: LodMeta = { source: path.basename(input), importedAt: new Date().toISOString(), entries: count }
writeFileSync(path.join(DEFAULT_DATA_DIR, 'meta.json'), JSON.stringify(meta, null, 2) + '\n')
console.log(`Imported ${count} LOD entries from ${meta.source}`)
