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

export async function generateMetadata({ params, searchParams }: PageProps<'/[locale]/listings'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const districts = await getDistricts(locale)
  const filters = readFilters(reader(await searchParams), districts.map((d) => d.key))
  return { title: pageTitle(locale, filters) }
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
