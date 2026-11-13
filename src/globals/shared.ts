import type { Field } from 'payload'

import { type AdminLabel } from '../collections/shared/labels'
import { DICTS, type Dict } from '../i18n/dictionaries'
import type { Lang } from '../types'

/** A translated text field whose default is the dictionary text for the language being edited. */
export const dictText = (name: string, en: AdminLabel, pick: (d: Dict) => string, multiline = false): Field => {
  const base = {
    name,
    localized: true,
    label: en,
    defaultValue: ({ locale }: { locale?: string }) => pick(DICTS[(locale ?? 'hy') as Lang]),
  }
  return multiline ? { ...base, type: 'textarea' } : { ...base, type: 'text' }
}

/** Empty or whitespace-only text from the admin counts as "not filled in". */
export const or = (v: string | null | undefined, fallback: string) => (v?.trim() ? v : fallback)
