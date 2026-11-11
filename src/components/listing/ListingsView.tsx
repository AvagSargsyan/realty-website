"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { motion } from "motion/react"
import { LayoutGrid, LoaderCircle, Rows3, SearchX, SlidersHorizontal, X } from "lucide-react"
import { useT } from "@/i18n/client"
import { useNavigate } from "@/components/providers/navigation-progress"
import { usePrice } from "@/components/providers/usePrice"
import { FilterPanel } from "@/components/filters/FilterPanel"
import { ListingCard } from "@/components/listing/ListingCard"
import { ListingRow } from "@/components/listing/ListingRow"
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  activeCount,
  EMPTY,
  PAGE_SIZE,
  SORTS,
  writeFilters,
  type FacetCounts,
  type Filters,
  type Sort,
  type View,
} from "@/lib/filters"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Listing, ListingDistrict } from "@/types"

type Chip = { key: string; label: string; remove: (f: Filters) => Filters }

/** Removable chips for every active filter value. */
function useChips(f: Filters, districts: ListingDistrict[]): Chip[] {
  const { t, lang } = useT()
  const { price } = usePrice()
  const districtName = (key: string) => districts.find((d) => d.key === key)?.name ?? key
  const range = (min: number | undefined, max: number | undefined, fmt: (n: number) => string) =>
    min !== undefined && max !== undefined ? `${fmt(min)} – ${fmt(max)}` : min !== undefined ? `${t.listings.from} ${fmt(min)}` : `${t.listings.upTo} ${fmt(max!)}`
  const chips: Chip[] = []
  if (f.text) chips.push({ key: "text", label: `“${f.text}”`, remove: (x) => ({ ...x, text: undefined }) })
  if (f.deal) chips.push({ key: "deal", label: t.deal[f.deal], remove: (x) => ({ ...x, deal: undefined }) })
  f.type.forEach((v) => chips.push({ key: `type-${v}`, label: t.typePlural[v], remove: (x) => ({ ...x, type: x.type.filter((y) => y !== v) }) }))
  f.district.forEach((v) => chips.push({ key: `d-${v}`, label: districtName(v), remove: (x) => ({ ...x, district: x.district.filter((y) => y !== v) }) }))
  f.rooms.forEach((v) => chips.push({ key: `r-${v}`, label: t.listings.roomsChip(v), remove: (x) => ({ ...x, rooms: x.rooms.filter((y) => y !== v) }) }))
  if (f.priceMin !== undefined || f.priceMax !== undefined)
    chips.push({ key: "price", label: range(f.priceMin, f.priceMax, price), remove: (x) => ({ ...x, priceMin: undefined, priceMax: undefined }) })
  if (f.areaMin !== undefined || f.areaMax !== undefined)
    chips.push({ key: "area", label: range(f.areaMin, f.areaMax, (n) => `${formatNumber(n, lang)} ${t.units.sqm}`), remove: (x) => ({ ...x, areaMin: undefined, areaMax: undefined }) })
  if (f.floorMin !== undefined || f.floorMax !== undefined)
    chips.push({ key: "floor", label: `${t.listings.floorChip} ${range(f.floorMin, f.floorMax, String)}`, remove: (x) => ({ ...x, floorMin: undefined, floorMax: undefined }) })
  f.tag.forEach((v) => chips.push({ key: `t-${v}`, label: t.tag[v], remove: (x) => ({ ...x, tag: x.tag.filter((y) => y !== v) }) }))
  f.condition.forEach((v) => chips.push({ key: `c-${v}`, label: t.condition[v], remove: (x) => ({ ...x, condition: x.condition.filter((y) => y !== v) }) }))
  f.building.forEach((v) => chips.push({ key: `b-${v}`, label: t.building[v], remove: (x) => ({ ...x, building: x.building.filter((y) => y !== v) }) }))
  return chips
}

function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const { t } = useT()
  const items: { v: View; icon: typeof LayoutGrid }[] = [
    { v: "grid", icon: LayoutGrid },
    { v: "list", icon: Rows3 },
  ]
  return (
    <div role="group" aria-label={t.listings.view.label} className="inline-flex rounded-md border border-line bg-background p-1">
      {items.map(({ v, icon: Icon }) => (
        <button
          key={v}
          type="button"
          aria-pressed={view === v}
          onClick={() => onChange(v)}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-sm px-3 text-sm font-semibold transition-colors",
            view === v ? "bg-iris text-white" : "text-ink/75 hover:bg-surface hover:text-ink",
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">{t.listings.view[v]}</span>
          <span className="sr-only sm:hidden">{t.listings.view[v]}</span>
        </button>
      ))}
    </div>
  )
}

type Props = {
  filters: Filters
  sort: Sort
  view: View
  page: number
  /** Listings shown: the first page × PAGE_SIZE results ("Load more" keeps earlier pages) */
  visible: Listing[]
  total: number
  counts: FacetCounts
  districts: ListingDistrict[]
}

/**
 * Listings page, ported from the demo. The filters live in the URL as before; changing one updates
 * the URL and the server sends back the new results and counts (src/app/(site)/[locale]/listings).
 */
export function ListingsView({ filters, sort, view, page, visible, total, counts, districts }: Props) {
  const { t } = useT()
  const pathname = usePathname()
  const params = useSearchParams()
  const { navigate, pending } = useNavigate()
  const chips = useChips(filters, districts)

  const go = (p: URLSearchParams, replace = false) => navigate(p.size ? `${pathname}?${p}` : pathname, { replace, scroll: false })
  const setFilters = (f: Filters) => go(writeFilters(f, params))
  const setParam = (key: string, value: string | null, replace = false) => {
    const p = new URLSearchParams(params)
    if (value === null) p.delete(key)
    else p.set(key, value)
    if (key !== "page") p.delete("page")
    go(p, replace)
  }
  const reset = () => setFilters(EMPTY)

  const title = filters.type.length === 1 ? t.typePlural[filters.type[0]] : t.listings.all
  const nActive = activeCount(filters)
  const results = { length: total }

  const filterButton = (
    <Sheet>
      <SheetTrigger asChild>
        <button type="button" className="btn-secondary h-11 px-4 lg:hidden">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          {t.listings.filters}
          {nActive > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-iris px-1.5 text-xs text-white">{nActive}</span>}
        </button>
      </SheetTrigger>
      <SheetContent side="left" showCloseButton={false} className="w-full gap-0 p-0 sm:max-w-md">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <SheetTitle className="font-heading text-lg font-bold text-ink">{t.listings.filters}</SheetTitle>
          <SheetClose className="icon-btn" aria-label={t.nav.close}>
            <X className="size-5" aria-hidden="true" />
          </SheetClose>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <FilterPanel filters={filters} onChange={setFilters} counts={counts} districts={districts} />
        </div>
        <div className="flex items-center gap-3 border-t border-line px-5 py-4">
          <button type="button" onClick={reset} disabled={nActive === 0} className="btn-secondary h-11 px-4">
            {t.listings.clearAll}
          </button>
          <SheetClose className="btn-primary h-11 flex-1">{t.listings.showResults(results.length)}</SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )

  const empty = (
    <div className="grid place-items-center rounded-lg border border-dashed border-line px-6 py-20 text-center">
      <SearchX className="size-10 text-muted-ink" aria-hidden="true" />
      <h2 className="mt-4 text-xl font-bold text-ink">{t.listings.empty.title}</h2>
      <p className="mt-2 max-w-sm text-muted-ink">{t.listings.empty.body}</p>
      <button type="button" onClick={reset} className="btn-primary mt-6">
        {t.listings.empty.reset}
      </button>
    </div>
  )

  const loadMore = visible.length < results.length && (
    <div className="mt-12 flex flex-col items-center gap-3">
      <p className="text-sm text-muted-ink">{t.listings.showing(visible.length, results.length)}</p>
      <button type="button" onClick={() => setParam("page", String(page + 1), true)} aria-busy={pending} className="btn-secondary">
        {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
        {t.listings.loadMore}
      </button>
    </div>
  )

  return (
    <div className="container-page pt-8 pb-20 md:pt-12">
      {/* Title row */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          {filters.deal && (
            <p className="mb-2 inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.22em] text-iris-ink uppercase">
              <span className="h-px w-8 bg-brand-bright" aria-hidden="true" />
              {t.deal[filters.deal]}
            </p>
          )}
          <h1 className="text-3xl leading-tight font-extrabold text-ink md:text-4xl">{title}</h1>
          <p className="mt-1.5 text-muted-ink" aria-live="polite">{t.listings.results(results.length)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {filterButton}
          <label className="flex items-center gap-2 text-sm text-muted-ink">
            <span className="hidden sm:inline">{t.listings.sort.label}</span>
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value === "newest" ? null : (e.target.value as Sort))}
              aria-label={t.listings.sort.label}
              className="h-11 cursor-pointer rounded-md border border-line bg-background px-3 text-sm font-medium text-ink hover:border-iris/40"
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>{t.listings.sort[s]}</option>
              ))}
            </select>
          </label>
          <ViewToggle view={view} onChange={(v) => setParam("view", v === "grid" ? null : v)} />
        </div>
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <ul className="flex flex-wrap items-center gap-2 pt-5" aria-label={t.listings.filters}>
          {chips.map((c) => (
            <li key={c.key}>
              <button type="button" onClick={() => setFilters(c.remove(filters))} aria-label={t.listings.remove(c.label)} className="chip-active gap-1.5 pr-2.5">
                {c.label}
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
          <li>
            <button type="button" onClick={reset} className="link-underline ml-1 text-sm font-semibold text-ink hover:text-iris-ink">
              {t.listings.clearAll}
            </button>
          </li>
        </ul>
      )}

      <div className="mt-6 grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)]">
          <aside aria-label={t.listings.filters} className="hidden lg:block">
            <FilterPanel filters={filters} onChange={setFilters} counts={counts} districts={districts} />
          </aside>
          {/* Dimmed while the next results load */}
          <div aria-busy={pending} className={cn("transition-opacity duration-200", pending && "opacity-60")}>
            {results.length === 0 ? (
              empty
            ) : view === "list" ? (
              <ul className="divide-y divide-line">
                {visible.map((l) => (
                  <li key={l.id} id={`listing-${l.id}`} className="py-7 first:pt-0">
                    <ListingRow listing={l} />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((l, i) => (
                  <motion.li
                    key={l.id}
                    id={`listing-${l.id}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(i % PAGE_SIZE, 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ListingCard listing={l} />
                  </motion.li>
                ))}
              </ul>
            )}
            {loadMore}
          </div>
        </div>
    </div>
  )
}
