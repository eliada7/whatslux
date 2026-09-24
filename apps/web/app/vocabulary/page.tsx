import { Deck } from '@/components/Deck'
import { getVocabulary } from '@/lib/api'
import { t } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export default async function VocabularyPage() {
  const entries = await getVocabulary().catch(() => undefined)

  return (
    <main className="page">
      <header className="page__header">
        <p className="greeting">
          <bdi dir="ltr" lang="lb">
            {t.greeting}
          </bdi>
        </p>
        <h1>{t.title}</h1>
        <p className="subtitle">{t.subtitle}</p>
      </header>
      {entries ? <Deck entries={entries} /> : <p className="empty">{t.apiDown}</p>}
    </main>
  )
}
