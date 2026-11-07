import type { Currency, Lang } from "@/types"

/** 1 USD = X, from Site settings. */
export type Rates = Record<Currency, number>

const SYMBOL: Record<Currency, string> = { USD: "$", AMD: "֏", RUB: "₽" }
const NUMBER_LOCALE: Record<Lang, string> = { en: "en-US", hy: "en-US", ru: "ru-RU" }

export function convert(usd: number, currency: Currency, rates: Rates) {
  return usd * rates[currency]
}

/** "$230,000", "89,010,000 ֏", "18 630 000 ₽" (same rules as the demo; rates come from Site settings) */
export function formatPrice(usd: number, currency: Currency, lang: Lang, rates: Rates) {
  const value = convert(usd, currency, rates)
  const rounded = currency === "USD" ? Math.round(value) : Math.round(value / 1000) * 1000
  const n = new Intl.NumberFormat(NUMBER_LOCALE[lang], { maximumFractionDigits: 0 }).format(rounded)
  return currency === "USD" ? `$${n}` : `${n} ${SYMBOL[currency]}`
}

export function formatNumber(n: number, lang: Lang) {
  return new Intl.NumberFormat(NUMBER_LOCALE[lang], { maximumFractionDigits: 1 }).format(n)
}

export function pricePerSqm(usd: number, area: number, currency: Currency, lang: Lang, rates: Rates) {
  if (!area) return ""
  return formatPrice(usd / area, currency, lang, rates)
}
