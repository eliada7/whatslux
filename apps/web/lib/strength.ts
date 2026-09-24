import { isDue } from '@whatslux/shared'
import type { StoredCard } from './srs-store'

/** Busuu-style word strength, derived from the SM-2 card. */
export type Strength = 0 | 1 | 2 | 3 // 0 new · 1 weak · 2 medium · 3 strong

export function strengthOf(card: StoredCard | undefined, now = new Date()): Strength {
  if (!card) return 0
  if (card.repetitions === 0) return 1
  // Overdue by more than its own interval: memory has faded
  const overdueDays = (now.getTime() - new Date(card.nextReviewAt).getTime()) / 86_400_000
  if (overdueDays > Math.max(1, card.interval)) return 1
  return card.repetitions >= 3 ? 3 : 2
}

export const isReviewDue = (card: StoredCard | undefined, now = new Date()) =>
  !!card && (isDue(new Date(card.nextReviewAt), now) || strengthOf(card, now) === 1)
