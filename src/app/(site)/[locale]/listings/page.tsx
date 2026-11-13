import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { ListingsView } from '@/components/listing/ListingsView'
import { isLocale } from '@/i18n/config'
import { DICTS } from '@/i18n/dictionaries'
import {
  applyFilters,
  EMPTY,
  facetCounts,
  PAGE_SIZE,
  parseQuery,
  readFilters,
  readPage,
  readSort,
  readView,
  writeFilters,
  type Filters,
} from '@/lib/filters'
import { findByCodes, getDistricts, getListingIndex } from '@/lib/listings'
import { pageMetadata } from '@/lib/seo'
import { getSiteSettings } from '@/lib/settings'
import type { Currency } from '@/types'

type SearchParams = Record<string, string | string[] | undefined>
const reader = (sp: SearchParams) => ({
  get: (k: string) => {
    const v = sp[k]
    return (Array.isArray(v) ? v[0] : v) ?? null
  },
})

function pageTitle(locale: keyof typeof DICTS, f: Filters) {
  const t = DICTS[locale]
  const title = f.type.length === 1 ? t.typePlural[f.type[0]] : t.listings.all
  return f.deal ? `${title} · ${t.deal[f.deal]}` : title
}

/** Keys a search engine may index: one deal, one type and one district (e.g. "apartments for sale in Arabkir"). */
const INDEXABLE = ['deal', 'type', 'district'] as const
/** Keys that only change how the same results look; the canonical address drops them. */
const PRESENTATION = ['sort', 'view', 'page']

export async function generateMetadata({ params, searchParams }: PageProps<'/[locale]/listings'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const sp = await searchParams
  const p = reader(sp)
  const districts = await getDistricts(locale)
  const filters = readFilters(p, districts.map((d) => d.key))
  const district = filters.district.length === 1 ? districts.find((d) => d.key === filters.district[0]) : undefined
  const title = district ? `${pageTitle(locale, filters)} · ${district.name}` : pageTitle(locale, filters)

  // Indexable when only the simple keys are used, each with one value. Anything else (rooms, price
  // ranges, several districts...) gets noindex,follow: too many combinations, mostly duplicates.
  const keys = Object.keys(sp).filter((k) => sp[k] !== undefined && sp[k] !== '' && !PRESENTATION.includes(k))
  const simple = keys.every((k) => (INDEXABLE as readonly string[]).includes(k)) && filters.type.length <= 1 && filters.district.length <= 1
  const canonical = new URLSearchParams()
  for (const k of INDEXABLE) {
    const v = p.get(k)
    if (v) canonical.set(k, v)
  }
  const qs = canonical.toString()
  return pageMetadata({ locale, path: `/listings${qs ? `?${qs}` : ''}`, title, description: DICTS[locale].footer.tagline, noindex: !simple })
}

/** Listings with filters, sorting, grid/list and "Load more" (same URL keys and behaviour as the demo). */
export default async function ListingsPage({ params, searchParams }: PageProps<'/[locale]/listings'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const p = reader(await searchParams)

  const [{ rows, districts: districtNames }, districts, settings] = await Promise.all([
    getListingIndex(),
    getDistricts(locale),
    getSiteSettings(locale),
  ])
  const districtKeys = districts.map((d) => d.key)

  // Header search: "?q=2 rooms in Kentron under $250k" becomes real filters. `cur` is the currency the
  // visitor had on screen, for prices typed without a sign.
  const q = p.get('q')
  if (q !== null) {
    const cur = p.get('cur')
    const shown: Currency = cur === 'AMD' || cur === 'RUB' ? cur : 'USD'
    const parsed = q.trim() ? parseQuery(q, districtNames, settings.rates, shown) : null
    const next: Filters = parsed ? { ...EMPTY, ...parsed } : { ...EMPTY, text: q.trim() || undefined }
    const qs = writeFilters(next, p).toString()
    redirect(`/${locale}/listings${qs ? `?${qs}` : ''}`)
  }

  const filters = readFilters(p, districtKeys)
  const sort = readSort(p)
  const view = readView(p)
  const page = readPage(p)

  const results = applyFilters(rows, filters, sort)
  const visible = await findByCodes(
    locale,
    results.slice(0, page * PAGE_SIZE).map((r) => r.id),
  )

  return (
    <ListingsView
      filters={filters}
      sort={sort}
      view={view}
      page={page}
      visible={visible}
      total={results.length}
      counts={facetCounts(rows, filters, districtKeys)}
      districts={districts}
    />
  )
}
