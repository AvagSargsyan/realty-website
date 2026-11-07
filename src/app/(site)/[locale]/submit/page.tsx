import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SubmitView } from '@/components/pages/SubmitView'
import { isLocale } from '@/i18n/config'
import { DICTS } from '@/i18n/dictionaries'
import { getDistricts } from '@/lib/listings'

export async function generateMetadata({ params }: PageProps<'/[locale]/submit'>): Promise<Metadata> {
  const { locale } = await params
  return isLocale(locale) ? { title: DICTS[locale].submit.title, description: DICTS[locale].submit.intro } : {}
}

export default async function Submit({ params }: PageProps<'/[locale]/submit'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <SubmitView districts={await getDistricts(locale)} />
}
