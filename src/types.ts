export type Lang = "hy" | "en" | "ru"
export type Currency = "USD" | "AMD" | "RUB"
export type Theme = "light" | "dark" | "system"
export type Localized = Record<Lang, string>

export type Deal = "sale" | "rent"
export type PropertyType = "apartment" | "house" | "commercial" | "land"
export type Tag = "exclusive" | "new" | "newConstruction" | "penthouse"
export type Building = "stone" | "panel" | "monolith"
export type Condition = "renovated" | "average" | "zero"

export type Property = {
  id: number
  deal: Deal
  type: PropertyType
  tags: Tag[]
  title: Localized
  region: string
  district: string
  street: Localized
  priceUsd: number
  oldPriceUsd?: number
  area: number
  rooms: number
  bedrooms: number
  bathrooms: number
  floor: number
  floors: number
  ceiling: number
  building: Building
  condition: Condition
  amenities: string[]
  description: Localized
  photos: string[]
  lat: number
  lng: number
  updatedAt: string
}
