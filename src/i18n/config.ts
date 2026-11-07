import type { Lang } from '@/types'

/** Site languages, in URL order. Armenian is the default (`/` redirects to `/hy` unless the browser prefers another). */
export const LOCALES = ['hy', 'en', 'ru'] as const satisfies readonly Lang[]
export const DEFAULT_LOCALE: Lang = 'hy'

export function isLocale(value: string): value is Lang {
  return (LOCALES as readonly string[]).includes(value)
}
