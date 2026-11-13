import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ContactPage } from '@/components/pages/ContactPage'
import { isLocale } from '@/i18n/config'
import { DICTS } from '@/i18n/dictionaries'
import { getIntro } from '@/lib/pages'
import { getSiteSettings } from '@/lib/settings'

export async function generateMetadata({ params }: PageProps<'/[locale]/contact'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const { title, intro } = await getIntro(locale, 'contact')
  return { title, description: intro }
}

export default async function Contact({ params }: PageProps<'/[locale]/contact'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [settings, intro] = await Promise.all([getSiteSettings(locale), getIntro(locale, 'contact')])
  return <ContactPage t={DICTS[locale]} settings={settings} intro={intro} />
}
