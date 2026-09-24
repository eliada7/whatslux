import { describe, expect, it } from 'vitest'
import { NEW_CARD, calculateNextReview, isDue, mapRatingToQuality } from './srs.js'

const now = new Date('2026-01-01T00:00:00Z')

describe('SM-2', () => {
  it('follows 1 → 6 → interval×EF on successive good answers', () => {
    const a = calculateNextReview(NEW_CARD, 4, now)
    expect(a.interval).toBe(1)
    const b = calculateNextReview(a, 4, now)
    expect(b.interval).toBe(6)
    const c = calculateNextReview(b, 4, now)
    expect(c.interval).toBe(Math.round(6 * b.easeFactor))
  })

  it('resets on failure but keeps ease factor ≥ 1.3', () => {
    let card = { easeFactor: 1.35, interval: 30, repetitions: 5 }
    const r = calculateNextReview(card, 0, now)
    expect(r.repetitions).toBe(0)
    expect(r.interval).toBe(1)
    expect(r.easeFactor).toBe(1.3)
  })

  it('schedules nextReviewAt interval days ahead', () => {
    const r = calculateNextReview({ easeFactor: 2.5, interval: 6, repetitions: 2 }, 5, now)
    expect(r.nextReviewAt.getTime() - now.getTime()).toBe(r.interval * 86_400_000)
  })

  it('treats HARD as a pass and AGAIN as a miss', () => {
    expect(mapRatingToQuality('HARD')).toBe(3)
    expect(calculateNextReview({ easeFactor: 2.5, interval: 6, repetitions: 2 }, mapRatingToQuality('HARD'), now).repetitions).toBe(3)
    expect(calculateNextReview({ easeFactor: 2.5, interval: 6, repetitions: 2 }, mapRatingToQuality('AGAIN'), now).repetitions).toBe(0)
  })

  it('isDue', () => {
    expect(isDue(new Date('2025-12-31'), now)).toBe(true)
    expect(isDue(new Date('2026-01-02'), now)).toBe(false)
  })
})
