import Anthropic from '@anthropic-ai/sdk'

/** Model from the product spec; override with ANTHROPIC_MODEL. */
export const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6'

let client: Anthropic | undefined

export function getClient(): Anthropic {
  client ??= new Anthropic()
  return client
}
