import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { FaqPage } from '@/components/pages/FaqPage'
import { isLocale } from '@/i18n/config'
import { DICTS } from '@/i18n/dictionaries'
import { getSiteSettings } from '@/lib/settings'

export async function generateMetadata({ params }: PageProps<'/[locale]/faq'>): Promise<Metadata> {
  const { locale } = await params
  return isLocale(locale) ? { title: DICTS[locale].faq.title, description: DICTS[locale].faq.intro } : {}
}

export default async function Faq({ params }: PageProps<'/[locale]/faq'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <FaqPage t={DICTS[locale]} settings={await getSiteSettings(locale)} />
}
