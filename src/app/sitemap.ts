import type { MetadataRoute } from 'next'

import { DEFAULT_LOCALE, LOCALES } from '@/i18n/config'
import { getSitemapListings } from '@/lib/listings'
import { propertyHref } from '@/lib/search'
import { absolute } from '@/lib/seo'
import type { Lang } from '@/types'

/** Rebuilt at most once an hour (new listings appear within that time). */
export const revalidate = 3600

const PAGES = ['', '/listings', '/listings?deal=sale', '/listings?deal=rent', '/about', '/faq', '/contact', '/submit', '/privacy', '/terms']

/** One entry per page and language, each listing its other-language versions (hreflang). */
function entry(pathFor: (l: Lang) => string, extra: Omit<MetadataRoute.Sitemap[number], 'url'> = {}) {
  const languages = { ...Object.fromEntries(LOCALES.map((l) => [l, absolute(`/${l}${pathFor(l)}`)])), 'x-default': absolute(`/${DEFAULT_LOCALE}${pathFor(DEFAULT_LOCALE)}`) }
  return LOCALES.map((l) => ({ url: absolute(`/${l}${pathFor(l)}`), alternates: { languages }, ...extra }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await getSitemapListings()
  return [
    ...PAGES.flatMap((path) => entry(() => path, { changeFrequency: path.startsWith('/listings') || !path ? 'daily' : 'monthly' })),
    ...listings.flatMap((l) => entry((lang) => propertyHref({ id: l.code, slug: l.slugs[lang] }), { lastModified: l.updatedAt, changeFrequency: 'weekly' })),
  ]
}
