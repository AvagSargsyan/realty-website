import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SubmitView } from '@/components/pages/SubmitView'
import { isLocale } from '@/i18n/config'
import { getDistricts } from '@/lib/listings'
import { getIntro } from '@/lib/pages'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: PageProps<'/[locale]/submit'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const { title, intro } = await getIntro(locale, 'submit')
  return pageMetadata({ locale, path: '/submit', title, description: intro })
}

export default async function Submit({ params }: PageProps<'/[locale]/submit'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [districts, intro] = await Promise.all([getDistricts(locale), getIntro(locale, 'submit')])
  return <SubmitView districts={districts} intro={intro} />
}
