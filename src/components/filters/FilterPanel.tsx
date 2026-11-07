"use client"

import { useId, useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { useT } from "@/i18n/client"
import { usePrice } from "@/components/providers/usePrice"
import { BUILDINGS, CONDITIONS, ROOMS, TAGS, TYPES, type FacetCounts, type FacetKey, type Filters } from "@/lib/filters"
import { REGION_NAMES } from "@/lib/regions"
import { cn } from "@/lib/utils"
import type { ListingDistrict, Region } from "@/types"

/** `counts` are worked out on the server for the current filters (see the listings page). */
type Props = { filters: Filters; onChange: (f: Filters) => void; counts: FacetCounts; districts: ListingDistrict[]; className?: string }
type ListKey = FacetKey

/** Collapsible filter group with a thin divider (Schoolhouse style). */
function Group({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group/f border-b border-line py-5 first:pt-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-ink select-none [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="size-4 text-muted-ink transition-transform duration-200 group-open/f:rotate-180" aria-hidden="true" />
      </summary>
      <div className="pt-4">{children}</div>
    </details>
  )
}

function Check({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
  const disabled = count === 0 && !checked
  return (
    <label className={cn("flex cursor-pointer items-center gap-3 py-1.5 text-sm text-ink", disabled && "cursor-default opacity-45")}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="size-[18px] shrink-0 cursor-pointer rounded-sm accent-[var(--iris)] disabled:cursor-default"
      />
      <span className="flex-1">{label}</span>
      <span className="text-xs text-muted-ink tabular-nums">{count}</span>
    </label>
  )
}

type RangeProps = {
  min?: number
  max?: number
  onCommit: (min?: number, max?: number) => void
  unit: string
  /** display value = stored value × scale (e.g. USD → AMD) */
  scale?: number
}

/** Min–max inputs. Re-mounted when the stored values change elsewhere (chips, reset, currency switch). */
function Range(props: RangeProps) {
  return <RangeInputs key={`${props.min}|${props.max}|${props.scale ?? 1}`} {...props} />
}

/** Commits on blur or Enter, so typing doesn't re-filter on every key. */
function RangeInputs({ min, max, onCommit, unit, scale = 1 }: RangeProps) {
  const { t } = useT()
  const uid = useId()
  // grouped digits ("20,250,000") so large AMD/RUB amounts stay readable
  const show = (v?: number) => (v === undefined ? "" : new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(v * scale)))
  const [lo, setLo] = useState(show(min))
  const [hi, setHi] = useState(show(max))

  const parse = (s: string) => {
    const n = Number(s.replace(/[\s,  ]/g, ""))
    return s.trim() === "" || !Number.isFinite(n) || n < 0 ? undefined : Math.round(n / scale)
  }
  const commit = () => onCommit(parse(lo), parse(hi))
  const input = "h-11 w-full min-w-0 rounded-md border border-line bg-background pr-10 pl-3 text-sm text-ink tabular-nums placeholder:text-muted-ink/70 hover:border-iris/40 focus-visible:border-iris-ink"

  return (
    <div className="flex items-center gap-2">
      {([
        [lo, setLo, t.listings.min, `${uid}-min`],
        [hi, setHi, t.listings.max, `${uid}-max`],
      ] as const).map(([value, set, label, id], i) => (
        <div key={id} className="contents">
          {i === 1 && <span className="text-muted-ink" aria-hidden="true">–</span>}
          <div className="relative flex-1">
            <label htmlFor={id} className="sr-only">{label}</label>
            <input
              id={id}
              inputMode="numeric"
              value={value}
              placeholder={label}
              onChange={(e) => set(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => e.key === "Enter" && commit()}
              className={input}
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-ink">{unit}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function FilterPanel({ filters: f, onChange, counts, districts, className }: Props) {
  const { t, lang } = useT()
  const { currency, rates } = usePrice()
  const rate = rates[currency]
  const symbol = { USD: "$", AMD: "֏", RUB: "₽" }[currency]

  const toggle = <K extends ListKey>(key: K, value: Filters[K][number]) => {
    const cur = f[key] as Filters[K][number][]
    onChange({ ...f, [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] })
  }
  const count = <K extends ListKey>(key: K, value: Filters[K][number]) => counts[key][String(value)] ?? 0

  return (
    <div className={className}>
      <Group title={t.listings.groups.deal}>
        {/* wraps when a label is long (e.g. Armenian "Վարձակալություն") instead of cutting it off */}
        <div role="group" aria-label={t.listings.groups.deal} className="flex flex-wrap gap-1 rounded-md bg-surface p-1">
          {([undefined, "sale", "rent"] as const).map((d) => (
            <button
              key={d ?? "any"}
              type="button"
              aria-pressed={f.deal === d}
              onClick={() => onChange({ ...f, deal: d })}
              className={cn(
                "h-9 flex-auto rounded-sm px-3 text-sm font-semibold whitespace-nowrap transition-colors",
                f.deal === d ? "bg-iris text-white shadow-sm" : "text-ink/75 hover:text-ink",
              )}
            >
              {d ? t.deal[d] : t.listings.anyDeal}
            </button>
          ))}
        </div>
      </Group>

      <Group title={t.listings.groups.type}>
        {TYPES.map((k) => (
          <Check key={k} label={t.typePlural[k]} count={count("type", k)} checked={f.type.includes(k)} onChange={() => toggle("type", k)} />
        ))}
      </Group>

      <Group title={t.listings.groups.price}>
        <Range
          min={f.priceMin}
          max={f.priceMax}
          unit={symbol}
          scale={rate}
          onCommit={(priceMin, priceMax) => onChange({ ...f, priceMin, priceMax })}
        />
      </Group>

      <Group title={t.listings.groups.rooms}>
        <div role="group" aria-label={t.listings.groups.rooms} className="grid grid-cols-5 gap-1.5">
          {ROOMS.map((n) => {
            const on = f.rooms.includes(n)
            return (
              <button
                key={n}
                type="button"
                aria-pressed={on}
                aria-label={t.listings.roomsChip(n)}
                onClick={() => toggle("rooms", n)}
                className={cn("h-10 rounded-md border text-sm font-semibold transition-colors", on ? "border-iris bg-iris text-white" : "border-line bg-background text-ink hover:border-iris/40")}
              >
                {n >= 5 ? "5+" : n}
              </button>
            )
          })}
        </div>
      </Group>

      <Group title={t.listings.groups.district}>
        {(Object.keys(REGION_NAMES) as Region[])
          .filter((region) => districts.some((d) => d.region === region))
          .map((region) => (
            <div key={region} className="mb-3 last:mb-0">
              <p className="mb-1 text-[0.7rem] font-semibold tracking-[0.12em] text-muted-ink uppercase">{REGION_NAMES[region][lang]}</p>
              {districts
                .filter((d) => d.region === region)
                .map((d) => (
                  <Check key={d.key} label={d.name} count={count("district", d.key)} checked={f.district.includes(d.key)} onChange={() => toggle("district", d.key)} />
                ))}
            </div>
          ))}
      </Group>

      <Group title={t.listings.groups.area}>
        <Range min={f.areaMin} max={f.areaMax} unit={t.units.sqm} onCommit={(areaMin, areaMax) => onChange({ ...f, areaMin, areaMax })} />
      </Group>

      <Group title={t.listings.groups.features}>
        {TAGS.map((k) => (
          <Check key={k} label={t.tag[k]} count={count("tag", k)} checked={f.tag.includes(k)} onChange={() => toggle("tag", k)} />
        ))}
      </Group>

      <Group title={t.listings.groups.floor} defaultOpen={false}>
        <Range min={f.floorMin} max={f.floorMax} unit="" onCommit={(floorMin, floorMax) => onChange({ ...f, floorMin, floorMax })} />
      </Group>

      <Group title={t.listings.groups.condition} defaultOpen={false}>
        {CONDITIONS.map((k) => (
          <Check key={k} label={t.condition[k]} count={count("condition", k)} checked={f.condition.includes(k)} onChange={() => toggle("condition", k)} />
        ))}
      </Group>

      <Group title={t.listings.groups.building} defaultOpen={false}>
        {BUILDINGS.map((k) => (
          <Check key={k} label={t.building[k]} count={count("building", k)} checked={f.building.includes(k)} onChange={() => toggle("building", k)} />
        ))}
      </Group>
    </div>
  )
}
