import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { FaqPage } from '@/components/pages/FaqPage'
import { isLocale } from '@/i18n/config'
import { DICTS } from '@/i18n/dictionaries'
import { faqJsonLd } from '@/lib/json-ld'
import { getFaqPage } from '@/lib/pages'
import { jsonLdScript, pageMetadata } from '@/lib/seo'
import { getSiteSettings } from '@/lib/settings'

export async function generateMetadata({ params }: PageProps<'/[locale]/faq'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const { title, intro } = await getFaqPage(locale)
  return pageMetadata({ locale, path: '/faq', title, description: intro })
}

export default async function Faq({ params }: PageProps<'/[locale]/faq'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [settings, content] = await Promise.all([getSiteSettings(locale), getFaqPage(locale)])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faqJsonLd(content.items))} />
      <FaqPage t={DICTS[locale]} settings={settings} content={content} />
    </>
  )
}
