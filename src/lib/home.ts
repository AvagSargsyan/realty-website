import 'server-only'

import config from '@payload-config'
import { getPayload } from 'payload'

import type { RowSource } from '@/globals/HomePage'
import { DICTS } from '@/i18n/dictionaries'
import { findByCodes, findListings, whereFromQuery } from '@/lib/listings'
import { listingsHref, type ListingQuery } from '@/lib/search'
import { toPhoto } from '@/lib/to-listing'
import type { HomePage } from '@/payload-types'
import type { Lang, Listing, Photo } from '@/types'

/** A row of listing cards on the home page. `viewAllHref` is missing for hand-picked rows. */
export type HomeRail = { title: string; items: Listing[]; total: number; viewAllHref?: string }

export type HomeContent = {
  hero: { eyebrow: string; title: string; intro: string; photos: (Photo | null)[] }
  popularTitle: string
  exclusive: HomeRail & { eyebrow: string; intro: string }
  row1: HomeRail
  row2: HomeRail
  services: { title: string; items: { title: string; body: string; cta: string }[] }
  cta: { title: string; body: string; primary: string; secondary: string }
}

const QUERIES: Record<Exclude<RowSource, 'manual'>, ListingQuery> = {
  exclusive: { tag: 'exclusive' },
  new: { tag: 'new' },
  rent: { deal: 'rent' },
  sale: { deal: 'sale' },
  penthouse: { tag: 'penthouse' },
  newConstruction: { tag: 'newConstruction' },
}

type RowConfig = { source?: RowSource | null; picks?: HomePage['row1']['picks'] }

async function loadRail(locale: Lang, title: string, row: RowConfig | undefined, fallback: RowSource, limit: number): Promise<HomeRail> {
  const source = row?.source ?? fallback
  if (source === 'manual') {
    // The global is read with depth 1, so picks are documents with their public code. findByCodes keeps
    // the editor's order and drops listings that are no longer published.
    const codes = (row?.picks ?? []).flatMap((p) => (typeof p === 'object' && p.code ? [p.code] : []))
    const items = await findByCodes(locale, codes)
    return { title, items, total: items.length }
  }
  const query = QUERIES[source]
  const { docs, total } = await findListings(locale, whereFromQuery(query), { limit })
  return { title, items: docs, total, viewAllHref: listingsHref(query) }
}

/**
 * The Home page global for one language, merged with the website's own wording: any empty text shows
 * the dictionary text of that language. No fallback to Armenian here (fallbackLocale: false), or an
 * English page would show Armenian text the editor hasn't translated yet.
 * The home page is prerendered, so this runs at build time and after admin changes (revalidateSite).
 */
export async function getHomeContent(locale: Lang): Promise<HomeContent> {
  const payload = await getPayload({ config })
  const g = await payload.findGlobal({ slug: 'home-page', locale, fallbackLocale: false, depth: 1 })
  const t = DICTS[locale].home
  const or = (v: string | null | undefined, d: string) => (v?.trim() ? v : d)

  const [exclusive, row1, row2] = await Promise.all([
    loadRail(locale, or(g.exclusive?.title, t.exclusive.title), g.exclusive, 'exclusive', 12),
    loadRail(locale, or(g.row1?.title, t.rows.newest), g.row1, 'new', 8),
    loadRail(locale, or(g.row2?.title, t.rows.rent), g.row2, 'rent', 8),
  ])

  const services = (['buy', 'sell', 'rent'] as const).map((key, i) => {
    const s = g.services?.[key]
    const d = t.services.items[i]
    return { title: or(s?.title, d.title), body: or(s?.body, d.body), cta: or(s?.cta, d.cta) }
  })

  return {
    hero: {
      eyebrow: or(g.hero?.eyebrow, t.hero.eyebrow),
      title: or(g.hero?.title, t.hero.title),
      intro: or(g.hero?.intro, t.hero.intro),
      photos: [toPhoto(g.hero?.photoTall), toPhoto(g.hero?.photoTop), toPhoto(g.hero?.photoBottom)],
    },
    popularTitle: or(g.popularTitle, t.popular.title),
    exclusive: { ...exclusive, eyebrow: or(g.exclusive?.eyebrow, t.exclusive.eyebrow), intro: or(g.exclusive?.intro, t.exclusive.intro) },
    row1,
    row2,
    services: { title: or(g.services?.title, t.services.title), items: services },
    cta: {
      title: or(g.cta?.title, t.cta.title),
      body: or(g.cta?.body, t.cta.body),
      primary: or(g.cta?.primary, t.cta.primary),
      secondary: or(g.cta?.secondary, t.cta.secondary),
    },
  }
}
