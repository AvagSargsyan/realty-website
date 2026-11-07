import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ContactPage } from '@/components/pages/ContactPage'
import { isLocale } from '@/i18n/config'
import { DICTS } from '@/i18n/dictionaries'
import { getSiteSettings } from '@/lib/settings'

export async function generateMetadata({ params }: PageProps<'/[locale]/contact'>): Promise<Metadata> {
  const { locale } = await params
  return isLocale(locale) ? { title: DICTS[locale].contact.title, description: DICTS[locale].contact.intro } : {}
}

export default async function Contact({ params }: PageProps<'/[locale]/contact'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <ContactPage t={DICTS[locale]} settings={await getSiteSettings(locale)} />
}
