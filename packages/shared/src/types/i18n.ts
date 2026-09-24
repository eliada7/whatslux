export const UI_LANGUAGES = ['ar', 'fr', 'ru', 'en', 'pt'] as const
export type UILanguage = (typeof UI_LANGUAGES)[number]

/** A string in every supported interface language. */
export type Localized = Record<UILanguage, string>

/** Some content is written for one language group first (e.g. Arabic) and translated later. */
export type PartialLocalized = Partial<Localized>
