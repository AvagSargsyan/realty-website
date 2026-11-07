import type { Metadata } from 'next'

import { FavoritesView } from '@/components/pages/FavoritesView'
import { isLocale } from '@/i18n/config'
import { DICTS } from '@/i18n/dictionaries'

export async function generateMetadata({ params }: PageProps<'/[locale]/favorites'>): Promise<Metadata> {
  const { locale } = await params
  // Personal to each visitor: keep it out of search results
  return isLocale(locale) ? { title: DICTS[locale].favorites.title, robots: { index: false } } : {}
}

export default function FavoritesPage() {
  return <FavoritesView />
}
