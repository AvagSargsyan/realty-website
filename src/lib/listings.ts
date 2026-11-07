import 'server-only'

import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import type { ListingQuery } from '@/lib/search'
import type { District, Media, Property } from '@/payload-types'
import type { Lang, Listing, ListingDistrict, Photo, Region } from '@/types'

/**
 * Listings for the public pages, read with the Payload Local API (a direct database query in the
 * same server, no HTTP). Pages are prerendered, so this mostly runs at build time and after the
 * admin changes something (see revalidateSite).
 */

const getClient = cache(async () => getPayload({ config }))

/** Listings visitors may see. Sold and rented ones stay reachable by URL but leave search and rails. */
export const ACTIVE: Where = { status: { equals: 'published' } }

function toPhoto(m: number | Media | null | undefined): Photo | null {
  if (!m || typeof m === 'number' || !m.url) return null
  const s = m.sizes
  // A size is missing when the original was smaller than it; fall back to the original
  return {
    alt: m.alt ?? '',
    thumb: s?.thumb?.url ?? m.url,
    card: s?.card?.url ?? m.url,
    large: s?.large?.url ?? m.url,
    full: m.url,
    og: s?.og?.url ?? undefined,
    width: m.width ?? undefined,
    height: m.height ?? undefined,
  }
}

function toDistrict(d: number | District): ListingDistrict {
  if (typeof d === 'number') return { key: '', name: '', region: 'yerevan' }
  return { key: d.key, name: d.name, region: d.region as Region }
}

/** Payload document -> the plain shape the components use. `maxPhotos` keeps card payloads small. */
export function toListing(p: Property, maxPhotos = Infinity): Listing {
  const photos = (p.photos ?? []).map(toPhoto).filter((x): x is Photo => x !== null).slice(0, maxPhotos)
  return {
    id: p.code ?? p.id,
    slug: p.slug ?? '',
    status: (p.status === 'sold' || p.status === 'rented' ? p.status : 'published') as Listing['status'],
    deal: p.deal,
    type: p.type,
    tags: (p.tags ?? []) as Listing['tags'],
    title: p.title,
    district: toDistrict(p.district),
    street: p.street ?? '',
    priceUsd: p.priceUsd,
    oldPriceUsd: p.oldPriceUsd && p.oldPriceUsd > p.priceUsd ? p.oldPriceUsd : undefined,
    area: p.area,
    rooms: p.rooms ?? 0,
    bedrooms: p.bedrooms ?? 0,
    bathrooms: p.bathrooms ?? 0,
    floor: p.floor ?? 0,
    floors: p.floors ?? 0,
    ceiling: p.ceiling ?? 0,
    building: p.building ?? undefined,
    condition: p.condition ?? undefined,
    amenities: p.amenities ?? [],
    description: p.description ?? '',
    photos,
    updatedAt: p.updatedAt,
  }
}

const CARD_PHOTOS = 5

/** Published listings matching `where`, newest first, ready for cards. */
export async function findListings(
  locale: Lang,
  where: Where = {},
  { limit = 12, page = 1, sort = '-updatedAt' }: { limit?: number; page?: number; sort?: string } = {},
) {
  const payload = await getClient()
  const res = await payload.find({
    collection: 'properties',
    where: { and: [ACTIVE, where] },
    locale,
    fallbackLocale: 'hy',
    depth: 1,
    limit,
    page,
    sort,
    overrideAccess: false,
  })
  return { docs: res.docs.map((p) => toListing(p, CARD_PHOTOS)), total: res.totalDocs, pages: res.totalPages }
}

/** Number of published listings matching `where`. */
export async function countListings(where: Where = {}) {
  const payload = await getClient()
  const res = await payload.count({ collection: 'properties', where: { and: [ACTIVE, where] }, overrideAccess: false })
  return res.totalDocs
}

/** The simple link filters used on the home page (?deal=sale&type=house ...) as a database query. */
export function whereFromQuery(q: ListingQuery): Where {
  const and: Where[] = []
  if (q.deal) and.push({ deal: { equals: q.deal } })
  if (q.type) and.push({ type: { equals: q.type } })
  if (q.district) and.push({ 'district.key': { equals: q.district } })
  if (q.tag) and.push({ tags: { in: [q.tag] } })
  if (q.priceMax) and.push({ priceUsd: { less_than_equal: q.priceMax } })
  return and.length ? { and } : {}
}

/** Districts in admin order, for the search box and filters. */
export const getDistricts = cache(async (locale: Lang): Promise<ListingDistrict[]> => {
  const payload = await getClient()
  const res = await payload.find({ collection: 'districts', locale, fallbackLocale: 'hy', limit: 100, sort: 'order', depth: 0 })
  return res.docs.map(toDistrict)
})

/** District id by URL key (?district=kentron), for filters. */
export async function districtIds(keys: string[]) {
  if (!keys.length) return []
  const payload = await getClient()
  const res = await payload.find({ collection: 'districts', where: { key: { in: keys } }, limit: 100, depth: 0 })
  return res.docs.map((d) => d.id)
}
