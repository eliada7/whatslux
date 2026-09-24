import { createReadStream, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import type { LodEntry } from './types.js'

export const DEFAULT_DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data')

export interface LodMeta {
  source: string
  importedAt: string
  entries: number
}

/** Normalised key for case-insensitive lookup. */
const key = (s: string) => s.normalize('NFC').toLowerCase()

/** In-memory index over the imported LOD dataset. */
export class LodIndex {
  private byIdMap = new Map<string, LodEntry>()
  private byLemmaMap = new Map<string, LodEntry[]>()

  constructor(entries: Iterable<LodEntry>, readonly meta?: LodMeta) {
    for (const e of entries) this.add(e)
  }

  private add(e: LodEntry) {
    this.byIdMap.set(e.id, e)
    const k = key(e.lemma)
    const list = this.byLemmaMap.get(k)
    if (list) list.push(e)
    else this.byLemmaMap.set(k, [e])
  }

  get size() {
    return this.byIdMap.size
  }

  all(): IterableIterator<LodEntry> {
    return this.byIdMap.values()
  }

  byId(id: string): LodEntry | undefined {
    return this.byIdMap.get(id)
  }

  /** Exact lemma match. Case matters in Luxembourgish (Wann = winch, wann = if), so filter by case unless asked not to. */
  byLemma(lemma: string, { ignoreCase = false } = {}): LodEntry[] {
    const all = this.byLemmaMap.get(key(lemma)) ?? []
    return ignoreCase ? all : all.filter((e) => e.lemma === lemma.normalize('NFC'))
  }

  /** Prefix search on lemmas, for editor autocomplete. */
  search(prefix: string, limit = 20): LodEntry[] {
    const p = key(prefix)
    const out: LodEntry[] = []
    for (const [k, list] of this.byLemmaMap) {
      if (k.startsWith(p)) out.push(...list)
      if (out.length >= limit) break
    }
    return out.slice(0, limit)
  }

  static async load(dataDir = DEFAULT_DATA_DIR): Promise<LodIndex> {
    const file = path.join(dataDir, 'lod-entries.jsonl')
    if (!existsSync(file)) throw new Error(`LOD data not found at ${file}. Run: pnpm lod:import <path to LOD zip>`)
    const metaFile = path.join(dataDir, 'meta.json')
    const meta = existsSync(metaFile) ? (JSON.parse(readFileSync(metaFile, 'utf8')) as LodMeta) : undefined
    const entries: LodEntry[] = []
    const rl = createInterface({ input: createReadStream(file, 'utf8'), crlfDelay: Infinity })
    for await (const line of rl) if (line) entries.push(JSON.parse(line) as LodEntry)
    return new LodIndex(entries, meta)
  }

  static exists(dataDir = DEFAULT_DATA_DIR): boolean {
    return existsSync(path.join(dataDir, 'lod-entries.jsonl'))
  }
}
