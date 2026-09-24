export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2'] as const
export type CEFRLevel = (typeof CEFR_LEVELS)[number]
