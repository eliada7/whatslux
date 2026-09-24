import { describe, expect, it } from 'vitest'
import { detectGermanInLuxembourgish } from './anti-confusion.js'

describe('detectGermanInLuxembourgish', () => {
  it('flags German forms', () => {
    const r = detectGermanInLuxembourgish('Ich habe gearbeitet und bin müde')
    expect(r.suspects.map((s) => s.word.toLowerCase())).toEqual(['ich', 'habe', 'und', 'bin'])
  })

  it('does not flag correct Luxembourgish', () => {
    for (const s of ["Ech hunn geschafft", "D'Buch ass gutt", 'Ech ginn heem', 'Ech wunnen an der Stad', 'Äddi, bis geschwënn']) {
      expect(detectGermanInLuxembourgish(s).hasGermanWords, s).toBe(false)
    }
  })

  it('is not fooled by German words inside longer Luxembourgish words', () => {
    expect(detectGermanInLuxembourgish('Den Här Schmitt ass doheem').hasGermanWords).toBe(false)
  })
})
