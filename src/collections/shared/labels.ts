import { DICTS, type Dict } from '../../i18n/dictionaries'

/**
 * Admin labels in the three admin languages. Payload shows the one matching the admin language.
 * `fromDict` reuses the website's own wording, so the admin and the site always say the same thing.
 */
export type AdminLabel = { en: string; hy: string; ru: string }

export const fromDict = (pick: (d: Dict) => string): AdminLabel => ({
  en: pick(DICTS.en),
  hy: pick(DICTS.hy),
  ru: pick(DICTS.ru),
})

/** For admin-only text that the website doesn't have. */
export const label = (en: string, hy: string, ru: string): AdminLabel => ({ en, hy, ru })

/** Select options whose labels come from a dictionary group, e.g. options(['sale','rent'], d => d.deal). */
export function options<K extends string>(values: readonly K[], group: (d: Dict) => Record<K, string>) {
  return values.map((value) => ({ value, label: fromDict((d) => group(d)[value]) }))
}
