import sax from 'sax'
import type { Readable } from 'node:stream'
import type { LodEntry, LodExample, LodMeaning, LodTargetLanguage } from './types.js'

const PUNCT = /^[!?.,;:)»"]/

/** Joins LOD example tokens: no space after an elided article (d', 't) or before punctuation. */
export function joinTokens(tokens: string[]): string {
  let out = ''
  for (const t of tokens) {
    if (!out || out.endsWith("'") || PUNCT.test(t)) out += t
    else out += ' ' + t
  }
  return out
}

/**
 * Streams the LOD open-data XML (new_lod-art.xml) and calls `onEntry` per article.
 * Streaming keeps memory flat — the file is ~100 MB.
 */
export function parseLodXml(input: Readable, onEntry: (e: LodEntry) => void): Promise<number> {
  return new Promise((resolve, reject) => {
    const parser = sax.createStream(true, { trim: false })
    const stack: string[] = []
    let text = ''
    let count = 0

    let entry: LodEntry | undefined
    let meaning: LodMeaning | undefined
    let lang: LodTargetLanguage | undefined
    let tokens: string[] | undefined
    let example: LodExample | undefined
    let pluralAttrs: { nRuleForm?: string } = {}
    let linkAttrs: { idRef?: string; relation?: string } = {}

    const parent = () => stack[stack.length - 2]

    parser.on('opentag', (node) => {
      stack.push(node.name)
      text = ''
      const a = node.attributes as Record<string, string>
      switch (node.name) {
        case 'entry':
          entry = { id: a.id, lemma: '', pos: '', meanings: [] }
          break
        case 'partOfSpeech':
          if (entry && parent() === 'microStructure' && !entry.pos) {
            if (a.gen) entry.gender = a.gen
            if (a.type) entry.posType = a.type
          }
          break
        case 'form':
          pluralAttrs = { nRuleForm: a.nRuleForm }
          break
        case 'internalLink':
          linkAttrs = { idRef: a.idRef, relation: a.relation }
          break
        case 'meaning':
          meaning = { id: a.id, translations: {}, examples: [] }
          break
        case 'targetLanguage':
          lang = a.lang as LodTargetLanguage
          break
        case 'example':
          if (meaning) example = { text: '', ...(a.id ? { id: a.id } : {}) }
          break
        case 'text':
          if (example && parent() === 'example') tokens = []
          break
      }
    })

    parser.on('text', (t) => (text += t))
    parser.on('cdata', (t) => (text += t))

    parser.on('closetag', (name) => {
      const value = text.trim()
      const up = parent()
      if (entry) {
        switch (name) {
          case 'lemma':
            if (up === 'entry') entry.lemma = value
            break
          case 'ipa':
            if (up === 'entry') entry.ipa = value
            break
          case 'partOfSpeech':
            if (up === 'microStructure' && !entry.pos) entry.pos = value
            break
          case 'form':
            ;(entry.plural ??= []).push({ form: value, ...(pluralAttrs.nRuleForm ? { nRuleForm: pluralAttrs.nRuleForm } : {}) })
            break
          case 'pastParticiple':
            ;(entry.pastParticiple ??= []).push(value)
            break
          case 'auxiliaryVerb':
            ;(entry.auxiliary ??= []).includes(value) || entry.auxiliary!.push(value)
            break
          case 'internalLink':
            if (up === 'microStructure' && linkAttrs.relation === 'Variant' && linkAttrs.idRef)
              entry.variantOf ??= { id: linkAttrs.idRef, lemma: value }
            break
          case 'secondaryHeadword':
            if (meaning) meaning.secondaryHeadword = value
            break
          case 'translation':
            if (meaning && lang && up === 'targetLanguage') (meaning.translations[lang] ??= []).push(value)
            break
          case 'targetLanguage':
            lang = undefined
            break
          case 'word':
          case 'inflectedHeadword':
            if (tokens && up === 'text') tokens.push(value)
            break
          case 'attribute':
            if (tokens && up === 'text' && example) (example.register ??= []).push(value)
            else if (meaning && up === 'meaning') (meaning.register ??= []).push(value)
            break
          case 'text':
            if (tokens && example) {
              example.text = joinTokens(tokens)
              tokens = undefined
            }
            break
          case 'example':
            if (example && meaning && example.text) meaning.examples.push(example)
            example = undefined
            break
          case 'meaning':
            if (meaning) entry.meanings.push(meaning)
            meaning = undefined
            break
          case 'entry':
            onEntry(entry)
            count++
            entry = undefined
            break
        }
      }
      stack.pop()
      text = ''
    })

    parser.on('error', reject)
    parser.on('end', () => resolve(count))
    input.pipe(parser)
  })
}
