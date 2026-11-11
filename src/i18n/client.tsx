'use client'

import NextLink from 'next/link'
import { createContext, useCallback, useContext, type ComponentProps, type ReactNode } from 'react'
import { LinkPending } from '@/components/providers/navigation-progress'
import type { Lang, Localized } from '@/types'
import { DICTS } from './dictionaries'

const LocaleContext = createContext<Lang | null>(null)

/** The language comes from the URL (`/hy/...`); the layout passes it down once. */
export function LocaleProvider({ locale, children }: { locale: Lang; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

export function useLocale(): Lang {
  const locale = useContext(LocaleContext)
  if (!locale) throw new Error('useLocale must be used inside <LocaleProvider>')
  return locale
}

/** Same API as the demo: interface text in the current language, plus a helper for localized data fields. */
export function useT() {
  const lang = useLocale()
  const t = DICTS[lang]
  const tl = useCallback((v: Localized) => v[lang] ?? v.en, [lang])
  return { t, tl, lang }
}

/** Prefix an internal path with a locale: ("/listings?deal=rent", "en") -> "/en/listings?deal=rent". */
export function localizedHref(href: string, locale: Lang) {
  if (!href.startsWith('/')) return href
  return href === '/' ? `/${locale}` : `/${locale}${href}`
}

/**
 * next/link that keeps the visitor in the current language. Write hrefs without the locale.
 * It also reports its pending state to the navigation progress bar.
 */
export function Link({ href, children, ...props }: Omit<ComponentProps<typeof NextLink>, 'href'> & { href: string }) {
  const locale = useLocale()
  return (
    <NextLink href={localizedHref(href, locale)} {...props}>
      {children}
      <LinkPending />
    </NextLink>
  )
}
