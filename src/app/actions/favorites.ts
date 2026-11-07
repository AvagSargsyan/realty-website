'use server'

import { isLocale } from '@/i18n/config'
import { findByCodes } from '@/lib/listings'
import type { Listing } from '@/types'

/**
 * Cards for the "Saved" page. Saved listing codes live in the visitor's browser, so the page asks
 * for just those. Only published listings come back (removed or sold ones simply drop out).
 */
export async function getSavedListings(locale: string, codes: number[]): Promise<Listing[]> {
  if (!isLocale(locale)) return []
  const clean = codes.filter((c) => Number.isInteger(c) && c > 0).slice(0, 100)
  return findByCodes(locale, clean)
}
