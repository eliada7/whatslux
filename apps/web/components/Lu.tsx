import type { VocabularyEntry } from '@whatslux/shared'
import { t } from '@/lib/i18n'

/** Luxembourgish is always isolated LTR inside the RTL page, so "d'" never jumps sides. */
export const Lu = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <bdi dir="ltr" lang="lb" className={`lu ${className}`}>
    {children}
  </bdi>
)

export const withArticle = (v: VocabularyEntry) =>
  (v.article ? (v.article.endsWith("'") ? v.article : `${v.article} `) : '') + v.word

/** Why this word takes its article — the n-rule explained on the word itself. */
export function GenderTip({ v }: { v: VocabularyEntry }) {
  const gender = v.gender?.length === 1 ? v.gender : undefined
  if (!gender) return null
  if (gender !== 'M')
    return (
      <>
        {t.gender[gender]} ← {t.always} <Lu className="tip-art">d'</Lu>
      </>
    )
  const first = v.word.charAt(0)
  const vowel = /[aeiouäëéèêàâîïôöüû]/i.test(first)
  return (
    <>
      {t.gender.M} ← <Lu className="tip-art">{v.article}</Lu> · {v.article === 'den' ? t.nRule.keep : t.nRule.drop}{' '}
      {vowel ? t.nRule.vowel : <Lu className="tip-art">{first.toUpperCase()}</Lu>}
    </>
  )
}
