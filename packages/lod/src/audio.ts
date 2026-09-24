/**
 * Pronunciation audio, as documented by the dataset publisher and checked live:
 * headwords at the lowercase article id (/uploads/AAC/dokter1.m4a), recorded
 * examples at /uploads/examples/AAC/{first two chars of id}/{id}.m4a.
 */
export function lodWordAudio(entryId: string): { aac: string; ogg: string } {
  const id = encodeURIComponent(entryId.toLowerCase())
  return {
    aac: `https://lod.lu/uploads/AAC/${id}.m4a`,
    ogg: `https://lod.lu/uploads/OGG/${id}.ogg`,
  }
}

export function lodArticleUrl(entryId: string): string {
  return `https://lod.lu/artikel/${encodeURIComponent(entryId)}`
}

export function lodExampleAudio(exampleId: string): { aac: string; ogg: string } {
  const id = encodeURIComponent(exampleId)
  const dir = id.slice(0, 2)
  return {
    aac: `https://lod.lu/uploads/examples/AAC/${dir}/${id}.m4a`,
    ogg: `https://lod.lu/uploads/examples/OGG/${dir}/${id}.ogg`,
  }
}
