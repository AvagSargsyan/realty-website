import 'server-only'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import type { DistrictNames, IndexRow } from '@/lib/filters'
import type { ListingQuery } from '@/lib/search'
import { toDistrict, toListing } from '@/lib/to-listing'
import type { Lang, Listing, ListingDistrict } from '@/types'

/**
 * Listings for the public pages, read with the Payload Local API (a direct database query in the
 * same server, no HTTP). Pages are prerendered, so this mostly runs at build time and after the
 * admin changes something (see revalidateSite).
 */

const getClient = cache(async () => getPayload({ config }))

/** Listings visitors may see. Sold and rented ones stay reachable by URL but leave search and rails. */
export const ACTIVE: Where = { status: { equals: 'published' } }

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

/** Cache tag cleared whenever listings or districts change in the admin (see revalidateSite). */
export const LISTINGS_TAG = 'listings'

/**
 * Districts in admin order, for the search box and filters. Kept in the Data Cache because the
 * listings page is rendered on every request (its filters are in the URL).
 */
export const getDistricts = cache(
  unstable_cache(
    async (locale: Lang): Promise<ListingDistrict[]> => {
      const payload = await getClient()
      const res = await payload.find({ collection: 'districts', locale, fallbackLocale: 'hy', limit: 100, sort: 'order', depth: 0 })
      return res.docs.map(toDistrict)
    },
    ['districts'],
    { tags: [LISTINGS_TAG], revalidate: 3600 },
  ),
)

/* ---------- Listings page: a cached index of every published listing ---------- */

type AllLocales<T> = { hy?: T | null; en?: T | null; ru?: T | null } | T | null | undefined
const allText = (v: AllLocales<string>) =>
  v && typeof v === 'object' ? [v.hy, v.en, v.ru].filter(Boolean).join(' ') : (v ?? '')

/**
 * Every published listing's filterable fields plus district names in all languages. One small query,
 * cached until the admin changes something, so filtering and facet counts run without the database.
 */
export const getListingIndex = unstable_cache(
  async (): Promise<{ rows: IndexRow[]; districts: DistrictNames }> => {
    const payload = await getClient()
    const [props, dists] = await Promise.all([
      payload.find({
        collection: 'properties',
        where: ACTIVE,
        locale: 'all',
        depth: 0,
        limit: 0, // all
        pagination: false,
        overrideAccess: false,
        select: {
          code: true, deal: true, type: true, district: true, rooms: true, priceUsd: true, area: true,
          floor: true, condition: true, building: true, tags: true, updatedAt: true, title: true, street: true,
        },
      }),
      payload.find({ collection: 'districts', locale: 'all', depth: 0, limit: 0, pagination: false }),
    ])

    const districts: DistrictNames = {}
    const keyById = new Map<number, string>()
    for (const d of dists.docs) {
      const name = d.name as unknown as AllLocales<string>
      const names = name && typeof name === 'object' ? name : { hy: name, en: name, ru: name }
      districts[d.key] = { hy: names.hy ?? '', en: names.en ?? '', ru: names.ru ?? '' }
      keyById.set(d.id, d.key)
    }

    const rows: IndexRow[] = props.docs.map((p) => {
      const district = keyById.get(p.district as number) ?? ''
      return {
        id: p.code ?? p.id,
        deal: p.deal,
        type: p.type,
        district,
        rooms: p.rooms ?? 0,
        priceUsd: p.priceUsd,
        area: p.area,
        floor: p.floor ?? 0,
        condition: p.condition ?? undefined,
        building: p.building ?? undefined,
        tags: (p.tags ?? []) as IndexRow['tags'],
        updatedAt: p.updatedAt,
        text: [
          allText(p.title as unknown as AllLocales<string>),
          allText(p.street as unknown as AllLocales<string>),
          ...Object.values(districts[district] ?? {}),
        ]
          .join(' ')
          .toLocaleLowerCase(),
      }
    })
    return { rows, districts }
  },
  ['listing-index'],
  { tags: [LISTINGS_TAG], revalidate: 3600 },
)

/** One listing by its public code, with all photos. Published, sold and rented listings are visible. */
export async function getPropertyByCode(locale: Lang, code: number): Promise<Listing | null> {
  if (!Number.isInteger(code)) return null
  const payload = await getClient()
  const res = await payload.find({
    collection: 'properties',
    where: { code: { equals: code } },
    locale,
    fallbackLocale: 'hy',
    depth: 1,
    limit: 1,
    overrideAccess: false, // visitors' access rules: drafts and archived listings stay hidden
  })
  return res.docs[0] ? toListing(res.docs[0]) : null
}

/** Same deal first, then same type, then same district (the demo's rule), newest first within a score. */
export function similarCodes(rows: IndexRow[], l: Pick<Listing, 'id' | 'deal' | 'type' | 'district'>) {
  return rows
    .filter((x) => x.id !== l.id && x.deal === l.deal)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((x) => ({ x, score: (x.type === l.type ? 2 : 0) + (x.district === l.district.key ? 1 : 0) }))
    .sort((a, b) => b.score - a.score)
    .map((s) => s.x.id)
}

/**
 * Full card data for the given public codes, in that order. Cached per language and list of codes
 * (the arguments are part of the cache key), so a repeated filter/page combination skips the
 * database; any admin change clears it with the rest of LISTINGS_TAG.
 */
export const findByCodes = unstable_cache(
  async (locale: Lang, codes: number[]): Promise<Listing[]> => {
    if (!codes.length) return []
    const payload = await getClient()
    const res = await payload.find({
      collection: 'properties',
      where: { and: [ACTIVE, { code: { in: codes } }] },
      locale,
      fallbackLocale: 'hy',
      depth: 1,
      limit: codes.length,
      pagination: false,
      overrideAccess: false,
    })
    const byCode = new Map(res.docs.map((p) => [p.code, toListing(p, CARD_PHOTOS)]))
    return codes.map((c) => byCode.get(c)).filter((l): l is Listing => Boolean(l))
  },
  ['cards-by-code'],
  { tags: [LISTINGS_TAG], revalidate: 3600 },
)
