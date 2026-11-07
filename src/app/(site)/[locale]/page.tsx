import { DICTS } from '@/i18n/dictionaries'
import { isLocale } from '@/i18n/config'
import { notFound } from 'next/navigation'

/** Placeholder until the home page is ported in Stage 2. */
export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = DICTS[locale]

  return (
    <section className="container-page flex min-h-[55vh] flex-col items-center justify-center py-24 text-center">
      <h1 className="text-4xl text-ink md:text-5xl">Avenue Real Estate Agency</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-ink">{t.footer.tagline}</p>
    </section>
  )
}
