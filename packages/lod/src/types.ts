/** One LOD dictionary article, reduced to what WhatsLUX uses. */
export interface LodEntry {
  /** LOD article id, e.g. "DOKTER1" */
  id: string
  lemma: string
  ipa?: string
  /** SUBST, VRB, ADJ, ADV, PRON, CONJ, PREP, INTERJ, NP (proper noun), … */
  pos: string
  /** Sub-type from LOD, e.g. PERS / INT / REL for pronouns, AUX for verbs */
  posType?: string
  /** Noun gender as LOD encodes it: M, F, N, or combinations such as MF */
  gender?: string
  plural?: Array<{ form: string; nRuleForm?: string }>
  pastParticiple?: string[]
  auxiliary?: string[]
  /** Set when LOD marks this article as a variant of another (e.g. dass → datt) */
  variantOf?: { id: string; lemma: string }
  meanings: LodMeaning[]
}

export type LodTargetLanguage = 'de' | 'fr' | 'en' | 'pt' | 'nl'

export interface LodMeaning {
  id: string
  /** Fixed expression this meaning belongs to, e.g. "blot A" */
  secondaryHeadword?: string
  translations: Partial<Record<LodTargetLanguage, string[]>>
  /** Register labels on this meaning (see LodRegister) */
  register?: LodRegister[]
  examples: LodExample[]
}

export interface LodExample {
  /** Sentence reconstructed from LOD's word tokens */
  text: string
  /** Present on recorded examples — see lodExampleAudio() */
  id?: string
  register?: LodRegister[]
}

/**
 * Register labels documented by the dataset publisher:
 * EGS colloquial · FAM crude · GEHUEW formal · KANNERSPROOCH child language ·
 * NEOL neologism · PEJ pejorative · VEREELZT archaic · VULG vulgar · IRON ironic
 */
export type LodRegister = 'EGS' | 'FAM' | 'GEHUEW' | 'KANNERSPROOCH' | 'NEOL' | 'PEJ' | 'VEREELZT' | 'VULG' | 'IRON' | (string & {})

/** Never shown to learners as model language. */
export const OFFENSIVE_REGISTERS: ReadonlySet<string> = new Set(['FAM', 'PEJ', 'VULG'])

export const isLearnerSafe = (x: { register?: string[] }) => !x.register?.some((r) => OFFENSIVE_REGISTERS.has(r))
