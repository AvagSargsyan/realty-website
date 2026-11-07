import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { cache } from 'react'

import { PropertyView } from '@/components/property/PropertyView'
import { isLocale } from '@/i18n/config'
import { findByCodes, getListingIndex, getPropertyByCode, similarCodes } from '@/lib/listings'
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
  return {
    title: l.title,
    description: l.description.slice(0, 160) || undefined,
    openGraph: l.photos[0]?.og ? { images: [{ url: l.photos[0].og, width: 1200, height: 630 }] } : undefined,
  }
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

  return <PropertyView key={listing.id} listing={listing} similar={similar} similarTotal={codes.length} />
}
