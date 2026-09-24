import type { UILanguage } from '../types/i18n.js'

export const LANGUAGE_META: Record<UILanguage, { name: string; nativeName: string; rtl: boolean }> = {
  ar: { name: 'Arabic', nativeName: 'العربية', rtl: true },
  fr: { name: 'French', nativeName: 'Français', rtl: false },
  ru: { name: 'Russian', nativeName: 'Русский', rtl: false },
  en: { name: 'English', nativeName: 'English', rtl: false },
  pt: { name: 'Portuguese', nativeName: 'Português', rtl: false },
}

export const isRTL = (lang: UILanguage): boolean => LANGUAGE_META[lang].rtl
