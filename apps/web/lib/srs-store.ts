import { NEW_CARD, type SRSCard } from '@whatslux/shared'

/**
 * Per-device review state until accounts exist. Wrapped in try/catch: storage
 * can be unavailable (private mode) and the deck must still work.
 */
export type StoredCard = SRSCard & { nextReviewAt: string }

const KEY = 'whatslux.srs.v1'

export function loadCards(): Record<string, StoredCard> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, StoredCard>
  } catch {
    return {}
  }
}

export function saveCards(cards: Record<string, StoredCard>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cards))
  } catch {
    /* storage unavailable — progress lives for this session only */
  }
}

export const cardOf = (cards: Record<string, StoredCard>, id: string): SRSCard => cards[id] ?? NEW_CARD
