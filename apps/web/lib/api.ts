import type { VocabularyEntry } from '@whatslux/shared'

const API_URL = process.env.API_URL ?? 'http://localhost:4000'

/** LOD-verified vocabulary from the backend (server-side fetch). */
export async function getVocabulary(): Promise<VocabularyEntry[]> {
  const res = await fetch(`${API_URL}/api/v1/vocabulary`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = (await res.json()) as { items: VocabularyEntry[] }
  return data.items
}
