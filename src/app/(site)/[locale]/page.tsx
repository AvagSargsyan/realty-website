import { notFound } from 'next/navigation'

import { Hero } from '@/components/home/Hero'
import { PopularTiles, Reviews, SellCta, Services } from '@/components/home/HomeSections'
import { CategoryRow, ExclusiveCarousel } from '@/components/home/ListingRails'
import { isLocale } from '@/i18n/config'
import { DICTS } from '@/i18n/dictionaries'
import { findListings, getDistricts, whereFromQuery } from '@/lib/listings'
import { listingsHref, TILES, type Tile } from '@/lib/search'

/** Popular-search tiles: live counts, and a different cover photo for each tile (as in the demo). */
async function getTiles(locale: Parameters<typeof findListings>[0]): Promise<Tile[]> {
  const results = await Promise.all(TILES.map((tile) => findListings(locale, whereFromQuery(tile.query), { limit: 4 })))
  const used = new Set<string>()
  return TILES.map((tile, i) => {
    const { docs, total } = results[i]
    const candidates = docs.flatMap((l) => l.photos.slice(0, 2))
    const cover = candidates.find((p) => !used.has(p.full)) ?? candidates[0]
    if (cover) used.add(cover.full)
    return { ...tile, count: total, cover }
  })
}

/** Home page, same sections and order as the demo, fed by published listings. */
export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = DICTS[locale]

  const [districts, tiles, exclusive, fresh, rent] = await Promise.all([
    getDistricts(locale),
    getTiles(locale),
    findListings(locale, whereFromQuery({ tag: 'exclusive' }), { limit: 12 }),
    findListings(locale, whereFromQuery({ tag: 'new' }), { limit: 8 }),
    findListings(locale, whereFromQuery({ deal: 'rent' }), { limit: 8 }),
  ])

  return (
    <>
      <Hero districts={districts} />
      <PopularTiles tiles={tiles} />
      <ExclusiveCarousel items={exclusive.docs} total={exclusive.total} viewAllHref={listingsHref({ tag: 'exclusive' })} />
      <CategoryRow
        title={t.home.rows.newest}
        items={fresh.docs}
        total={fresh.total}
        viewAllHref={listingsHref({ tag: 'new' })}
        className="pt-16 md:pt-24"
      />
      <CategoryRow
        title={t.home.rows.rent}
        items={rent.docs}
        total={rent.total}
        viewAllHref={listingsHref({ deal: 'rent' })}
        className="pt-16 md:pt-20"
      />
      <Services />
      <Reviews />
      <SellCta />
    </>
  )
}
