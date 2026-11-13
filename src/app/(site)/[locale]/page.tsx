import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Hero } from '@/components/home/Hero'
import { PopularTiles, Reviews, SellCta, Services } from '@/components/home/HomeSections'
import { CategoryRow, ExclusiveCarousel } from '@/components/home/ListingRails'
import { isLocale } from '@/i18n/config'
import { getHomeContent } from '@/lib/home'
import { findListings, getDistricts, whereFromQuery } from '@/lib/listings'
import { TILES, type Tile } from '@/lib/search'
import { pageMetadata, SITE_NAME } from '@/lib/seo'

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

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const home = await getHomeContent(locale)
  const meta = pageMetadata({ locale, path: '', title: `${SITE_NAME}: ${home.hero.title}`, description: home.hero.intro })
  return { ...meta, title: { absolute: `${SITE_NAME}: ${home.hero.title}` } }
}

/** Home page, same sections and order as the demo. Texts and listing rows come from the Home page global. */
export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const [districts, tiles, home] = await Promise.all([getDistricts(locale), getTiles(locale), getHomeContent(locale)])

  return (
    <>
      <Hero districts={districts} content={home.hero} />
      <PopularTiles tiles={tiles} title={home.popularTitle} />
      <ExclusiveCarousel rail={home.exclusive} />
      <CategoryRow rail={home.row1} className="pt-16 md:pt-24" />
      <CategoryRow rail={home.row2} className="pt-16 md:pt-20" />
      <Services content={home.services} />
      <Reviews content={home.reviews} />
      <SellCta content={home.cta} />
    </>
  )
}
