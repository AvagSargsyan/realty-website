"use client"

import { useId, useState, type FormEvent, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Search } from "lucide-react"
import { localizedHref, useT } from "@/i18n/client"
import { usePrice } from "@/components/providers/usePrice"
import { REGION_NAMES } from "@/lib/regions"
import { listingsHref, PRICE_STEPS } from "@/lib/search"
import { cn } from "@/lib/utils"
import type { Deal, ListingDistrict, PropertyType, Region } from "@/types"

const TYPES: PropertyType[] = ["apartment", "house", "commercial", "land"]

function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-[0.7rem] font-semibold tracking-[0.12em] text-muted-ink uppercase">
        {label}
      </label>
      <div className="relative">
        {children}
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-ink" aria-hidden="true" />
      </div>
    </div>
  )
}

const selectCls =
  "h-12 w-full cursor-pointer appearance-none truncate rounded-md border border-line bg-background pr-9 pl-3 text-sm text-ink transition-colors hover:border-iris/40 focus-visible:border-iris-ink"

/** Hero search: Sale/Rent, type, district and max price. Opens /listings with those filters. */
export function SearchBox({ className, districts }: { className?: string; districts: ListingDistrict[] }) {
  const { t, lang } = useT()
  const { price } = usePrice()
  const router = useRouter()
  const navigate = (href: string) => router.push(localizedHref(href, lang))
  const uid = useId()
  const [deal, setDeal] = useState<Deal>("sale")
  const [type, setType] = useState<PropertyType | "">("")
  const [district, setDistrict] = useState("")
  const [priceMax, setPriceMax] = useState("")

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    navigate(listingsHref({ deal, type: type || undefined, district: district || undefined, priceMax: priceMax ? Number(priceMax) : undefined }))
  }

  const districtsByRegion = (Object.keys(REGION_NAMES) as Region[])
    .map((region) => ({ region, items: districts.filter((d) => d.region === region) }))
    .filter((g) => g.items.length > 0)

  return (
    <form
      role="search"
      aria-label={t.home.search.label}
      onSubmit={onSubmit}
      className={cn("rounded-lg border border-line bg-background p-4 shadow-[0_24px_60px_-32px_rgba(11,31,39,0.45)] md:p-5", className)}
    >
      <div role="group" aria-label={t.home.search.deal} className="mb-4 inline-flex rounded-md bg-surface p-1">
        {(["sale", "rent"] as const).map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={deal === d}
            onClick={() => {
              setDeal(d)
              setPriceMax("")
            }}
            className={cn(
              "h-9 rounded-sm px-4 text-sm font-semibold transition-colors duration-200",
              deal === d ? "bg-iris text-white shadow-sm" : "text-ink/75 hover:text-ink",
            )}
          >
            {t.deal[d]}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t.home.search.type} id={`${uid}-type`}>
          <select id={`${uid}-type`} value={type} onChange={(e) => setType(e.target.value as PropertyType | "")} className={selectCls}>
            <option value="">{t.home.search.anyType}</option>
            {TYPES.map((k) => (
              <option key={k} value={k}>{t.typePlural[k]}</option>
            ))}
          </select>
        </Field>

        <Field label={t.home.search.district} id={`${uid}-district`}>
          <select id={`${uid}-district`} value={district} onChange={(e) => setDistrict(e.target.value)} className={selectCls}>
            <option value="">{t.home.search.anyDistrict}</option>
            {districtsByRegion.map((g) => (
              <optgroup key={g.region} label={REGION_NAMES[g.region][lang]}>
                {g.items.map((d) => (
                  <option key={d.key} value={d.key}>{d.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>

        <Field label={t.home.search.maxPrice} id={`${uid}-price`}>
          <select id={`${uid}-price`} value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className={selectCls}>
            <option value="">{t.home.search.anyPrice}</option>
            {PRICE_STEPS[deal].map((usd) => (
              <option key={usd} value={usd}>
                {t.home.search.upTo(price(usd))}
                {deal === "rent" ? ` ${t.card.perMonth}` : ""}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full">
            <Search className="size-4" aria-hidden="true" />
            {t.home.search.submit}
          </button>
        </div>
      </div>
    </form>
  )
}
