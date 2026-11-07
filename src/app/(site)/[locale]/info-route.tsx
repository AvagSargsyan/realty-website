import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { InfoPage, type InfoKey } from '@/components/pages/InfoPage'
import { isLocale } from '@/i18n/config'
import { DICTS } from '@/i18n/dictionaries'

type Props = { params: Promise<{ locale: string }> }

/** Shared by /about, /privacy and /terms: same layout, different text. */
export function infoRoute(page: InfoKey) {
  return {
    async generateMetadata({ params }: Props): Promise<Metadata> {
      const { locale } = await params
      return isLocale(locale) ? { title: DICTS[locale].info[page].title } : {}
    },
    async Page({ params }: Props) {
      const { locale } = await params
      if (!isLocale(locale)) notFound()
      return <InfoPage t={DICTS[locale]} page={page} />
    },
  }
}
