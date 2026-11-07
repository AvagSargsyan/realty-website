import type { Building, Condition, Currency, Deal, PropertyType, Tag } from "@/types"
import type { Rates } from "./format"

/**
 * Listing filters, ported from the demo (src/lib/filters.ts). Stored in the page address so results
 * can be shared and the back button works; same URL keys as the demo. Prices are always USD in the
 * URL. Multi-value keys are comma-separated (type=apartment,house).
 *
 * The demo filtered its JSON in the browser. Here the same functions run on the server, over a small
 * index of all published listings (see getListingIndex), so results and facet counts match the demo.
 */
export type Sort = "newest" | "priceAsc" | "priceDesc" | "areaDesc"
export type View = "grid" | "list"

export type Filters = {
  deal?: Deal
  type: PropertyType[]
  district: string[]
  rooms: number[] // 5 means "5 or more"
  priceMin?: number
  priceMax?: number
  areaMin?: number
  areaMax?: number
  floorMin?: number
  floorMax?: number
  condition: Condition[]
  building: Building[]
  tag: Tag[]
  text?: string // free text the parser could not turn into filters
}

/** The fields filtering needs, one row per published listing. `text` = titles, streets and district names in all languages, lowercased. */
export type IndexRow = {
  id: number
  deal: Deal
  type: PropertyType
  district: string
  rooms: number
  priceUsd: number
  area: number
  floor: number
  condition?: Condition
  building?: Building
  tags: Tag[]
  updatedAt: string
  text: string
}

/** District names in all languages, keyed by URL key, for the free-text parser. */
export type DistrictNames = Record<string, { hy: string; en: string; ru: string }>

export const PAGE_SIZE = 12
export const TYPES: PropertyType[] = ["apartment", "house", "commercial", "land"]
export const CONDITIONS: Condition[] = ["renovated", "average", "zero"]
export const BUILDINGS: Building[] = ["stone", "monolith", "panel"]
export const TAGS: Tag[] = ["exclusive", "new", "newConstruction"]
export const ROOMS = [1, 2, 3, 4, 5]
export const SORTS: Sort[] = ["newest", "priceAsc", "priceDesc", "areaDesc"]
export const VIEWS: View[] = ["grid", "list"]

type Params = { get(key: string): string | null }

const list = <T extends string>(v: string | null, allowed?: readonly T[]) =>
  (v ? v.split(",").filter(Boolean) : []).filter((x) => !allowed || allowed.includes(x as T)) as T[]
const num = (v: string | null) => {
  if (v === null || v === "") return undefined
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

export function readFilters(p: Params, districtKeys: string[]): Filters {
  const deal = p.get("deal")
  return {
    deal: deal === "sale" || deal === "rent" ? deal : undefined,
    type: list(p.get("type"), TYPES),
    district: list(p.get("district"), districtKeys),
    rooms: list(p.get("rooms")).map(Number).filter((n) => ROOMS.includes(n)),
    priceMin: num(p.get("priceMin")),
    priceMax: num(p.get("priceMax")),
    areaMin: num(p.get("areaMin")),
    areaMax: num(p.get("areaMax")),
    floorMin: num(p.get("floorMin")),
    floorMax: num(p.get("floorMax")),
    condition: list(p.get("condition"), CONDITIONS),
    building: list(p.get("building"), BUILDINGS),
    tag: list(p.get("tag"), TAGS),
    text: p.get("text") || undefined,
  }
}

export const readSort = (p: Params): Sort => (SORTS.includes(p.get("sort") as Sort) ? (p.get("sort") as Sort) : "newest")
export const readView = (p: Params): View => (VIEWS.includes(p.get("view") as View) ? (p.get("view") as View) : "grid")
export const readPage = (p: Params) => Math.max(1, Math.floor(num(p.get("page")) ?? 1))

/** Write filters back, keeping sort/view, dropping empty values and resetting "load more". */
export function writeFilters(f: Filters, current: Params) {
  const p = new URLSearchParams()
  const set = (k: string, v: unknown) => {
    if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) return
    p.set(k, Array.isArray(v) ? v.join(",") : String(v))
  }
  set("deal", f.deal)
  set("type", f.type)
  set("district", f.district)
  set("rooms", f.rooms)
  set("priceMin", f.priceMin)
  set("priceMax", f.priceMax)
  set("areaMin", f.areaMin)
  set("areaMax", f.areaMax)
  set("floorMin", f.floorMin)
  set("floorMax", f.floorMax)
  set("condition", f.condition)
  set("building", f.building)
  set("tag", f.tag)
  set("text", f.text)
  for (const k of ["sort", "view"]) {
    const v = current.get(k)
    if (v) p.set(k, v)
  }
  return p
}

export const EMPTY: Filters = { type: [], district: [], rooms: [], condition: [], building: [], tag: [] }

export function activeCount(f: Filters) {
  return (
    (f.deal ? 1 : 0) + f.type.length + f.district.length + f.rooms.length + f.condition.length + f.building.length + f.tag.length +
    (f.priceMin !== undefined || f.priceMax !== undefined ? 1 : 0) +
    (f.areaMin !== undefined || f.areaMax !== undefined ? 1 : 0) +
    (f.floorMin !== undefined || f.floorMax !== undefined ? 1 : 0) +
    (f.text ? 1 : 0)
  )
}

const inRange = (v: number, min?: number, max?: number) => (min === undefined || v >= min) && (max === undefined || v <= max)

export function matchesFilters(l: IndexRow, f: Filters) {
  return (
    (!f.deal || l.deal === f.deal) &&
    (!f.type.length || f.type.includes(l.type)) &&
    (!f.district.length || f.district.includes(l.district)) &&
    (!f.rooms.length || f.rooms.some((r) => (r >= 5 ? l.rooms >= 5 : l.rooms === r))) &&
    inRange(l.priceUsd, f.priceMin, f.priceMax) &&
    inRange(l.area, f.areaMin, f.areaMax) &&
    ((f.floorMin === undefined && f.floorMax === undefined) || (l.type === "apartment" && inRange(l.floor, f.floorMin, f.floorMax))) &&
    (!f.condition.length || (l.condition !== undefined && f.condition.includes(l.condition))) &&
    (!f.building.length || (l.building !== undefined && f.building.includes(l.building))) &&
    (!f.tag.length || f.tag.every((tg) => l.tags.includes(tg))) &&
    (!f.text || matchesText(l, f.text))
  )
}

function matchesText(l: IndexRow, text: string) {
  const needle = text.toLocaleLowerCase()
  return needle.split(/\s+/).filter(Boolean).every((w) => l.text.includes(w))
}

export function applyFilters(all: IndexRow[], f: Filters, sort: Sort) {
  const out = all.filter((l) => matchesFilters(l, f))
  const by: Record<Sort, (a: IndexRow, b: IndexRow) => number> = {
    newest: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
    priceAsc: (a, b) => a.priceUsd - b.priceUsd,
    priceDesc: (a, b) => b.priceUsd - a.priceUsd,
    areaDesc: (a, b) => b.area - a.area,
  }
  return out.sort(by[sort])
}

export type FacetKey = "type" | "district" | "condition" | "building" | "tag" | "rooms"
/** Facet counts for the filter panel: counts[key][value] = results if that value were picked. */
export type FacetCounts = Record<FacetKey, Record<string, number>>

/** How many results a facet value would give, with every other filter group kept as is. */
export function facetCount<K extends FacetKey>(all: IndexRow[], f: Filters, key: K, value: Filters[K][number]) {
  const probe = { ...f, [key]: [value] } as Filters
  return all.filter((l) => matchesFilters(l, probe)).length
}

export function facetCounts(all: IndexRow[], f: Filters, districtKeys: string[]): FacetCounts {
  const of = <K extends FacetKey>(key: K, values: readonly Filters[K][number][]) =>
    Object.fromEntries(values.map((v) => [String(v), facetCount(all, f, key, v)]))
  return {
    type: of("type", TYPES),
    district: of("district", districtKeys),
    rooms: of("rooms", ROOMS),
    condition: of("condition", CONDITIONS),
    building: of("building", BUILDINGS),
    tag: of("tag", TAGS),
  }
}

/* ---------- Header search: turn free text into filters (hy / en / ru), unchanged from the demo ---------- */

const TYPE_WORDS: [PropertyType, RegExp][] = [
  ["apartment", /apartment|flat|квартир|բնակարան/i],
  ["house", /\bhouse|villa|cottage|\bдом|особняк|коттедж|առանձնատ|տուն|տնակ/i],
  ["commercial", /commercial|office|shop|коммерч|офис|магазин|կոմերց|գրասենյակ|խանութ/i],
  ["land", /\bland\b|plot|участ|земл|հող/i],
]
const RENT_WORDS = /\brent|for rent|\blet\b|аренд|сним|сдаю|վարձ/i
const SALE_WORDS = /\bbuy|for sale|\bsale|куп|продаж|գն|վաճառ/i

/** Which currency a typed price is in: an explicit sign/word wins, otherwise the one on screen. */
function priceCurrency(s: string, shown: Currency): Currency {
  if (/\$|usd|долл|դոլ/i.test(s)) return "USD"
  if (/֏|amd|драм|դրամ/i.test(s)) return "AMD"
  if (/₽|rub|руб|ռուբ/i.test(s)) return "RUB"
  return shown
}

/** Returns the filters it understood (prices converted to USD), or null if it understood nothing. */
export function parseQuery(q: string, districts: DistrictNames, rates: Rates, shown: Currency = "USD"): Partial<Filters> | null {
  const s = q.toLocaleLowerCase()
  const out: Partial<Filters> = {}

  const district = Object.entries(districts).find(([key, names]) =>
    [key, names.en, names.hy, names.ru].some((n) => n && s.includes(n.toLocaleLowerCase().slice(0, Math.max(4, n.length - 1)))),
  )
  if (district) out.district = [district[0]]

  for (const [type, re] of TYPE_WORDS)
    if (re.test(s)) {
      out.type = [type]
      break
    }

  if (RENT_WORDS.test(s)) out.deal = "rent"
  else if (SALE_WORDS.test(s)) out.deal = "sale"

  const rooms = s.match(/(\d)\s*(?:-|\s)?(?:rooms?|bed|комн|к\b|-к|սենյակ)/i)
  if (rooms) out.rooms = [Math.min(5, Number(rooms[1]))]

  const price = s.match(/(?:under|below|up to|max|до|не дороже|մինչև|մինչեւ)\s*\$?\s*(\d+(?:[.,]\d+)?)\s*(k|к|тыс|m|млн)?/i)
  if (price) {
    const mult = /k|к|тыс/i.test(price[2] ?? "") ? 1_000 : /m|млн/i.test(price[2] ?? "") ? 1_000_000 : 1
    const amount = Number(price[1].replace(",", ".")) * mult
    out.priceMax = Math.round(amount / rates[priceCurrency(s, shown)])
  }

  return Object.keys(out).length ? out : null
}
