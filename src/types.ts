export type Lang = "hy" | "en" | "ru"
export type Currency = "USD" | "AMD" | "RUB"
export type Theme = "light" | "dark" | "system"
export type Localized = Record<Lang, string>

export type Deal = "sale" | "rent"
export type PropertyType = "apartment" | "house" | "commercial" | "land"
export type Tag = "exclusive" | "new" | "newConstruction" | "penthouse"
export type Building = "stone" | "panel" | "monolith"
export type Condition = "renovated" | "average" | "zero"

export type Region = "yerevan" | "kotayk"

/** One photo in the fixed Payload sizes (URLs on the Blob CDN, or /api/media locally). */
export type Photo = {
  alt: string
  thumb: string // 480 px
  card: string // 800 px
  large: string // 1600 px
  full: string // original, max 2000 px
  og?: string // 1200×630 JPEG
  width?: number
  height?: number
}

export type ListingDistrict = { key: string; name: string; region: Region }

/**
 * A listing as the website's components use it: plain values in the visitor's language.
 * Built on the server from the Payload document (src/lib/listings.ts). Replaces the demo's
 * `Property`, whose texts were objects with all three languages and photos were Unsplash IDs.
 */
export type Listing = {
  id: number // the public code, e.g. 422001
  slug: string
  status: "published" | "sold" | "rented"
  deal: Deal
  type: PropertyType
  tags: Tag[]
  title: string
  district: ListingDistrict
  street: string
  priceUsd: number
  oldPriceUsd?: number
  area: number
  rooms: number
  bedrooms: number
  bathrooms: number
  /** Left empty in the admin = undefined, so the page can show "—" instead of 0 */
  floor?: number
  floors?: number
  ceiling?: number
  building?: Building
  condition?: Condition
  amenities: string[]
  description: string
  photos: Photo[]
  updatedAt: string
}
