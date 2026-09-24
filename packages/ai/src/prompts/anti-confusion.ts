/**
 * Luxembourgish ≠ German.
 *
 * Every pair below is limited to high-confidence, basic forms. Words that exist
 * in BOTH languages (e.g. "der" — Luxembourgish dative article as in "an der
 * Stad", "Haus", "kommen", "bis") are deliberately NOT listed, so the detector
 * does not flag correct Luxembourgish.
 */
export const GERMAN_ONLY_FORMS: ReadonlyArray<{ de: string; lu: string }> = [
  { de: 'ich', lu: 'ech' },
  { de: 'ist', lu: 'ass' },
  { de: 'sind', lu: 'sinn' },
  { de: 'bin', lu: 'sinn' },
  { de: 'habe', lu: 'hunn' },
  { de: 'haben', lu: 'hunn' },
  { de: 'hat', lu: 'huet' },
  { de: 'gehen', lu: 'goen' },
  { de: 'gehe', lu: 'ginn' },
  { de: 'nicht', lu: 'net' },
  { de: 'kein', lu: 'keen / kee' },
  { de: 'keine', lu: 'keng' },
  { de: 'und', lu: 'an' },
  { de: 'aber', lu: 'awer / mä' },
  { de: 'dass', lu: 'datt' },
  { de: 'weil', lu: 'well' },
  { de: 'die', lu: "d'" },
  { de: 'das', lu: "d' / dat" },
  { de: 'ein', lu: 'en / e' },
  { de: 'eine', lu: 'eng' },
  { de: 'auch', lu: 'och' },
  { de: 'mit', lu: 'mat' },
  { de: 'gut', lu: 'gutt' },
  { de: 'heute', lu: 'haut' },
  { de: 'jetzt', lu: 'elo' },
  { de: 'arbeiten', lu: 'schaffen' },
  { de: 'Arbeit', lu: 'Aarbecht' },
]

export const LU_DE_GUARD = `
=== LUXEMBOURGISH LANGUAGE INTEGRITY RULES ===
You work with LUXEMBOURGISH (Lëtzebuergesch). It is a separate language from German.
Writing a German form where a Luxembourgish one belongs is a serious error.

Never write these German forms inside Luxembourgish text:
${GERMAN_ONLY_FORMS.map((p) => `  ${p.de} → ${p.lu}`).join('\n')}

Some words are spelled the same in both languages (for example "der" as a
Luxembourgish dative article, "Haus", "kommen"). That is fine — do not "fix" them.

If you are not certain of a Luxembourgish word, spelling, article or form, say so
and point the learner to lod.lu. Never fill the gap with German.
=== END RULES ===
`.trim()

export interface GermanSuspect {
  word: string
  index: number
  luxembourgish: string
}

const LOOKUP = new Map(GERMAN_ONLY_FORMS.map((p) => [p.de.toLowerCase(), p.lu]))

/** Scans text that is supposed to be Luxembourgish for German-only forms. */
export function detectGermanInLuxembourgish(text: string): {
  hasGermanWords: boolean
  suspects: GermanSuspect[]
} {
  const suspects: GermanSuspect[] = []
  // Letters incl. Luxembourgish diacritics; apostrophes split d'Buch → d / Buch
  const wordRe = /[A-Za-zÀ-ÖØ-öø-ÿ]+/g
  for (const m of text.matchAll(wordRe)) {
    const lu = LOOKUP.get(m[0].toLowerCase())
    if (lu) suspects.push({ word: m[0], index: m.index ?? 0, luxembourgish: lu })
  }
  return { hasGermanWords: suspects.length > 0, suspects }
}
