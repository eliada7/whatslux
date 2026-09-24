import { createReadStream } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { LodIndex, definiteArticle, isLearnerSafe, joinTokens, lodExampleAudio, lodWordAudio, parseLodXml, type LodEntry } from '../src/index.js'

async function parseFixture(): Promise<LodEntry[]> {
  const entries: LodEntry[] = []
  await parseLodXml(createReadStream(new URL('./fixture.xml', import.meta.url)), (e) => entries.push(e))
  return entries
}

describe('parseLodXml', () => {
  it('extracts noun data, translations and examples', async () => {
    const [dokter] = await parseFixture()
    expect(dokter).toMatchObject({
      id: 'DOKTER1',
      lemma: 'Dokter',
      pos: 'SUBST',
      gender: 'M',
      plural: [{ form: 'Dokteren', nRuleForm: 'Doktere' }],
    })
    expect(dokter.meanings[0].translations.fr).toEqual(['médecin'])
    // gloss text is not an example; register labels are not words
    expect(dokter.meanings[0].examples).toEqual([
      { id: '9c09eb87e688a5f4fc2e719e202fc6a7', text: "ech hunn d'nächst Woch e Rendez-vous beim Dokter" },
      { text: 'hal däin Zil A!', register: ['EGS'] },
    ])
  })

  it('extracts verb data and variants', async () => {
    const entries = await parseFixture()
    expect(entries[1]).toMatchObject({ lemma: 'schaffen', pos: 'VRB', pastParticiple: ['geschafft'], auxiliary: ['hunn'] })
    expect(entries[2].variantOf).toEqual({ id: 'DATT1', lemma: 'datt' })
  })
})

describe('LodIndex', () => {
  it('respects case: wann (if/when) ≠ Wann (winch)', async () => {
    const index = new LodIndex(await parseFixture())
    expect(index.byLemma('wann').map((e) => e.id)).toEqual(['WANN2'])
    expect(index.byLemma('Wann').map((e) => e.id)).toEqual(['WANN3'])
    expect(index.byLemma('wann', { ignoreCase: true })).toHaveLength(2)
  })
})

describe('helpers', () => {
  it('applies the n-rule to the masculine article', () => {
    expect(definiteArticle('M', 'Dokter')).toBe('den')
    expect(definiteArticle('M', 'Interview')).toBe('den')
    expect(definiteArticle('M', 'Formulaire')).toBe('de')
    expect(definiteArticle('M', 'Kontrakt')).toBe('de')
    expect(definiteArticle('F', 'Gemeng')).toBe("d'")
    expect(definiteArticle('MF', 'Wann')).toBeUndefined()
  })

  it('builds audio URLs', () => {
    expect(lodWordAudio('DOKTER1').aac).toBe('https://lod.lu/uploads/AAC/dokter1.m4a')
    expect(lodExampleAudio('9c09eb87e688a5f4fc2e719e202fc6a7').ogg).toBe(
      'https://lod.lu/uploads/examples/OGG/9c/9c09eb87e688a5f4fc2e719e202fc6a7.ogg',
    )
  })

  it('keeps crude, pejorative and vulgar examples away from learners', () => {
    expect(isLearnerSafe({ register: ['EGS'] })).toBe(true)
    expect(isLearnerSafe({ register: ['VULG'] })).toBe(false)
    expect(isLearnerSafe({})).toBe(true)
  })

  it('joins tokens without spaces after elision or before punctuation', () => {
    expect(joinTokens(["d'", 'Buch', 'ass', 'gutt', '!'])).toBe("d'Buch ass gutt!")
  })
})
