import type { District, Media, Property } from '@/payload-types'
import type { Listing, ListingDistrict, Photo, Region } from '@/types'

/**
 * Payload document -> the plain shape the website's components use. Shared by the server (pages)
 * and the browser (live preview, where the document is the admin form while it's being edited,
 * so any field can still be empty).
 */

export function toPhoto(m: number | Media | null | undefined): Photo | null {
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

export function toDistrict(d: number | District | null | undefined): ListingDistrict {
  if (!d || typeof d === 'number') return { key: '', name: '', region: 'yerevan' }
  return { key: d.key ?? '', name: d.name ?? '', region: (d.region ?? 'yerevan') as Region }
}

/** `maxPhotos` keeps card payloads small. */
export function toListing(p: Partial<Property>, maxPhotos = Infinity): Listing {
  const photos = (p.photos ?? []).map(toPhoto).filter((x): x is Photo => x !== null).slice(0, maxPhotos)
  const priceUsd = p.priceUsd ?? 0
  return {
    id: p.code ?? p.id ?? 0,
    slug: p.slug ?? '',
    status: (p.status === 'sold' || p.status === 'rented' ? p.status : 'published') as Listing['status'],
    deal: p.deal ?? 'sale',
    type: p.type ?? 'apartment',
    tags: (p.tags ?? []) as Listing['tags'],
    title: p.title ?? '',
    district: toDistrict(p.district),
    street: p.street ?? '',
    priceUsd,
    oldPriceUsd: p.oldPriceUsd && p.oldPriceUsd > priceUsd ? p.oldPriceUsd : undefined,
    area: p.area ?? 0,
    rooms: p.rooms ?? 0,
    bedrooms: p.bedrooms ?? 0,
    bathrooms: p.bathrooms ?? 0,
    floor: p.floor ?? undefined,
    floors: p.floors || undefined,
    ceiling: p.ceiling || undefined,
    building: p.building ?? undefined,
    condition: p.condition ?? undefined,
    amenities: p.amenities ?? [],
    description: p.description ?? '',
    photos,
    updatedAt: p.updatedAt ?? new Date().toISOString(),
  }
}
