/** SM-2 spaced repetition. */

export interface SRSCard {
  /** Starts at 2.5, never below 1.3 */
  easeFactor: number
  /** Days until the next review */
  interval: number
  repetitions: number
}

/** 0–2 failed · 3 hard · 4 good · 5 easy */
export type Quality = 0 | 1 | 2 | 3 | 4 | 5

export type Rating = 'AGAIN' | 'HARD' | 'OK' | 'EASY'

export const NEW_CARD: SRSCard = { easeFactor: 2.5, interval: 0, repetitions: 0 }

const DAY_MS = 24 * 60 * 60 * 1000

export function calculateNextReview(
  card: SRSCard,
  quality: Quality,
  now: Date = new Date(),
): SRSCard & { nextReviewAt: Date } {
  let { easeFactor, interval, repetitions } = card

  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easeFactor)
    repetitions += 1
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  return { easeFactor, interval, repetitions, nextReviewAt: new Date(now.getTime() + interval * DAY_MS) }
}

/**
 * HARD still counts as a successful recall (quality 3). The original spec mapped
 * HARD to 2, which resets the card to day 1 every time a learner struggles but
 * remembers — AGAIN is the rating for a real miss.
 */
export function mapRatingToQuality(rating: Rating): Quality {
  const map: Record<Rating, Quality> = { AGAIN: 1, HARD: 3, OK: 4, EASY: 5 }
  return map[rating]
}

export function isDue(nextReviewAt: Date, now: Date = new Date()): boolean {
  return nextReviewAt.getTime() <= now.getTime()
}
