import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { cache } from 'react'

import { PropertyView } from '@/components/property/PropertyView'
import { isLocale } from '@/i18n/config'
import { DICTS } from '@/i18n/dictionaries'
import { listingJsonLd } from '@/lib/json-ld'
import { findByCodes, getListingIndex, getPropertyByCode, getPropertySlugs, similarCodes } from '@/lib/listings'
import { propertyHref } from '@/lib/search'
import { jsonLdScript, pageMetadata } from '@/lib/seo'
import type { Lang } from '@/types'

// Each listing page is rendered on its first visit, then cached until the admin changes something
// (revalidateSite) or an hour passes.
export const dynamicParams = true
export const revalidate = 3600
export function generateStaticParams() {
  return []
}

const load = cache((locale: Lang, id: string) => getPropertyByCode(locale, Number(id)))

export async function generateMetadata({ params }: PageProps<'/[locale]/property/[id]/[[...slug]]'>): Promise<Metadata> {
  const { locale, id } = await params
  if (!isLocale(locale)) return {}
  const l = await load(locale, id)
  if (!l) return {}
  const slugs = await getPropertySlugs(l.id)
  const t = DICTS[locale]
  // Description: the agent's text, or a summary built from the facts when it's empty
  const summary = [t.type[l.type], t.deal[l.deal], `${l.area} ${t.units.sqm}`, l.district.name].join(' · ')
  const description = (l.description || summary).replace(/\s+/g, ' ').trim()
  return pageMetadata({
    locale,
    path: (lang) => propertyHref({ id: l.id, slug: slugs[lang] }),
    title: l.title,
    description: description.length > 160 ? `${description.slice(0, 157).trimEnd()}…` : description,
    // Generated card: cover photo with price and district (src/app/og). `v` changes with every edit,
    // so social networks and the CDN fetch a new image after a price change.
    image: `/og/${locale}/property/${l.id}?v=${Date.parse(l.updatedAt) || 0}`,
    type: 'article',
  })
}

/** /hy/property/422001/2-senyakanots-bnakaran-...: the slug is for people and search engines; the code finds the listing. */
export default async function PropertyPage({ params }: PageProps<'/[locale]/property/[id]/[[...slug]]'>) {
  const { locale, id, slug } = await params
  if (!isLocale(locale)) notFound()
  const listing = await load(locale, id)
  if (!listing) notFound()

  // Missing or outdated slug (title changed, other language): send to the current address
  if (listing.slug && (slug?.length !== 1 || slug[0] !== listing.slug)) {
    permanentRedirect(`/${locale}/property/${listing.id}/${listing.slug}`)
  }

  const { rows } = await getListingIndex()
  const codes = similarCodes(rows, listing)
  const similar = await findByCodes(locale, codes.slice(0, 8))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(listingJsonLd(locale, listing))} />
      <PropertyView key={listing.id} listing={listing} similar={similar} similarTotal={codes.length} />
    </>
  )
}
