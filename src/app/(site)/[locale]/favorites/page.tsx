import type { Metadata } from 'next'

import { FavoritesView } from '@/components/pages/FavoritesView'
import { isLocale } from '@/i18n/config'
import { DICTS } from '@/i18n/dictionaries'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: PageProps<'/[locale]/favorites'>): Promise<Metadata> {
  const { locale } = await params
  // Personal to each visitor: keep it out of search results
  return isLocale(locale) ? pageMetadata({ locale, path: '/favorites', title: DICTS[locale].favorites.title, noindex: true }) : {}
}

export default function FavoritesPage() {
  return <FavoritesView />
}
