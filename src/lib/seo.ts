import type { Metadata } from 'next'

import { DEFAULT_LOCALE, LOCALES } from '@/i18n/config'
import type { Lang } from '@/types'

/**
 * The public address of this deployment, for canonical links, the sitemap and Open Graph:
 * NEXT_PUBLIC_SITE_URL if set (a custom domain), else the address Vercel gives production or the
 * staging branch, else localhost.
 */
export const SITE_URL = (() => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  const host =
    process.env.VERCEL_ENV === 'production' ? process.env.VERCEL_PROJECT_PRODUCTION_URL : process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL
  return host ? `https://${host}` : 'http://localhost:3000'
})()

/** Only production may be indexed (staging and local also send an X-Robots-Tag header, see next.config.ts). */
export const IS_INDEXABLE = process.env.VERCEL_ENV === 'production'

export const SITE_NAME = 'Avenue Real Estate'

const OG_LOCALE: Record<Lang, string> = { hy: 'hy_AM', en: 'en_US', ru: 'ru_RU' }

/** Make a site path (`/hy/about`) or a relative file URL absolute. */
export const absolute = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`)

/**
 * Canonical and hreflang links. `pathFor(locale)` is the page's path without the language prefix
 * (e.g. `/about`), so pages whose address differs per language (listing slugs) can say so.
 */
export function alternates(locale: Lang, pathFor: string | ((l: Lang) => string)): { canonical: string; languages: Record<string, string> } {
  const path = (l: Lang) => `/${l}${typeof pathFor === 'string' ? pathFor : pathFor(l)}`.replace(/\/$/, '')
  return {
    canonical: path(locale),
    languages: { ...Object.fromEntries(LOCALES.map((l) => [l, path(l)])), 'x-default': path(DEFAULT_LOCALE) },
  }
}

type PageMeta = {
  locale: Lang
  /** Path without the language prefix, or one per language */
  path: string | ((l: Lang) => string)
  title: string
  description?: string
  /** Absolute or site-relative image URL, 1200×630 */
  image?: string
  type?: 'website' | 'article'
  /** Keep out of search results, still follow its links */
  noindex?: boolean
}

/**
 * Title, description, canonical, hreflang, Open Graph and Twitter for one page. Next.js merges
 * `openGraph` shallowly, so every page sets all of it here instead of inheriting parts from the layout.
 */
export function pageMetadata({ locale, path, title, description, image, type = 'website', noindex }: PageMeta): Metadata {
  const alt = alternates(locale, path)
  const images = [{ url: image ?? `/og/${locale}`, width: 1200, height: 630, alt: title }]
  return {
    title,
    description,
    alternates: noindex ? undefined : alt,
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      url: alt.canonical,
      title,
      description,
      images,
    },
    twitter: { card: 'summary_large_image', title, description, images: images.map((i) => i.url) },
  }
}

/** A JSON-LD <script>. `<` is escaped so text from the admin can't close the script tag. */
export function jsonLdScript(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') }
}
