import { OFFICIAL_REFERENCES } from './references.js'

/**
 * Sproochentest structure used by the simulator.
 *
 * NOT YET VERIFIED: durations and task lists below come from the product spec,
 * not from the official exam body. Confirm every value on the official site
 * before showing it to learners as fact. `verified` gates the UI copy.
 */
export const SPROOCHENTEST_CONFIG = {
  officialSite: OFFICIAL_REFERENCES.sproochentest,
  verified: false,
  speaking: {
    level: 'A2' as const,
    tasks: ['SELF_INTRODUCTION', 'PICTURE_DESCRIPTION', 'TOPIC_CONVERSATION'] as const,
  },
  listening: {
    level: 'B1' as const,
  },
}
