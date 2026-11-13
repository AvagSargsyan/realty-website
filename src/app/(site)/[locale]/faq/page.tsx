import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { FaqPage } from '@/components/pages/FaqPage'
import { isLocale } from '@/i18n/config'
import { DICTS } from '@/i18n/dictionaries'
import { getFaqPage } from '@/lib/pages'
import { getSiteSettings } from '@/lib/settings'

export async function generateMetadata({ params }: PageProps<'/[locale]/faq'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const { title, intro } = await getFaqPage(locale)
  return { title, description: intro }
}

export default async function Faq({ params }: PageProps<'/[locale]/faq'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [settings, content] = await Promise.all([getSiteSettings(locale), getFaqPage(locale)])
  return <FaqPage t={DICTS[locale]} settings={settings} content={content} />
}
