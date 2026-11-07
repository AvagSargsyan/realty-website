import type { Deal, Photo, PropertyType, Tag } from "@/types"

/**
 * Listing filters as they appear in the page address (/listings?...), same keys as the demo.
 * Prices are always in USD in the URL, whatever currency is shown.
 */
export type ListingQuery = {
  deal?: Deal
  type?: PropertyType
  district?: string
  tag?: Tag
  priceMax?: number
}

export function listingsHref(q: ListingQuery = {}) {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(q)) if (v !== undefined && v !== "") params.set(k, String(v))
  const s = params.toString()
  return s ? `/listings?${s}` : "/listings"
}

/** Home page "Popular searches" tiles (from the demo). */
export type TileKey = "aptSale" | "houses" | "newBuild" | "kentron" | "rent" | "commercial"
export const TILES: { key: TileKey; query: ListingQuery }[] = [
  { key: "aptSale", query: { deal: "sale", type: "apartment" } },
  { key: "houses", query: { deal: "sale", type: "house" } },
  { key: "newBuild", query: { tag: "newConstruction" } },
  { key: "kentron", query: { district: "kentron" } },
  { key: "rent", query: { deal: "rent" } },
  { key: "commercial", query: { type: "commercial" } },
]
export type Tile = { key: TileKey; query: ListingQuery; count: number; cover?: Photo }

/** Max-price choices in the home search box (USD). */
export const PRICE_STEPS: Record<Deal, number[]> = {
  sale: [50_000, 100_000, 150_000, 200_000, 300_000, 500_000],
  rent: [500, 1_000, 1_500, 2_000, 3_000, 5_000],
}

/** Public path of a listing (Link adds the locale): /property/422001/2-room-apartment-on-gai-avenue */
export function propertyHref(l: { id: number; slug: string }) {
  return l.slug ? `/property/${l.id}/${l.slug}` : `/property/${l.id}`
}
