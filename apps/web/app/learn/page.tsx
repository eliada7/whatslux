import { Session } from '@/components/session/Session'
import { getVocabulary } from '@/lib/api'
import { t } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const entries = await getVocabulary().catch(() => undefined)
  return entries ? <Session entries={entries} mode="learn" /> : <p className="empty">{t.apiDown}</p>
}
