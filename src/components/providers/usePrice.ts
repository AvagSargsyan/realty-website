"use client"

import { useCallback } from "react"

import { useT } from "@/i18n/client"
import { formatPrice, pricePerSqm } from "@/lib/format"
import { useCurrency } from "./preferences"
import { useSettings } from "./SettingsProvider"

/** Prices in the visitor's currency, converted with the rates from Site settings. */
export function usePrice() {
  const [currency] = useCurrency()
  const { rates } = useSettings()
  const { lang } = useT()
  const price = useCallback((usd: number) => formatPrice(usd, currency, lang, rates), [currency, lang, rates])
  const perSqm = useCallback(
    (usd: number, area: number) => pricePerSqm(usd, area, currency, lang, rates),
    [currency, lang, rates],
  )
  return { price, perSqm, currency, rates }
}
