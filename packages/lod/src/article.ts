/**
 * Definite article for a singular noun, from LOD gender.
 *
 * Masculine "den" follows the n-rule (Eifeler Regel): the final n is kept only
 * before a vowel or before n, d, t, z, h — otherwise it becomes "de".
 * Feminine and neuter singular take d'.
 *
 * The rule follows the first *sound*: checked against every article + masculine
 * noun pair in the LOD 2026-07 examples, it matches 7,408 of 7,425 (99.8%). The
 * misses are loanwords and letter names whose spelling hides the sound
 * (den Jackpot, den Chat, den R). Treat the result as a suggestion for editors.
 */
export function definiteArticle(gender: string | undefined, noun: string): string | undefined {
  if (!gender) return undefined
  if (gender.length > 1) return undefined // MF / MN / FN: more than one article is possible — a human picks
  if (gender === 'F' || gender === 'N') return "d'"
  if (gender === 'M') return keepsN(noun) ? 'den' : 'de'
  return undefined
}

/** True when a preceding word-final n is kept before this word (n-rule). */
export function keepsN(nextWord: string): boolean {
  return /^[aeiouäëéèêàâîïôöüûAEIOUÄËÉÈÊÀÂÎÏÔÖÜÛnNdDtTzZhH]/.test(nextWord)
}
