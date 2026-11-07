'use client'

import { Link, useT } from '@/i18n/client'

/** Ported from the demo's NotFound page. */
export default function NotFound() {
  const { t } = useT()
  return (
    <section className="container-page flex min-h-[55vh] flex-col items-center justify-center py-24 text-center">
      <title>{`${t.notFound.title} · Avenue Real Estate`}</title>
      <p className="font-heading text-7xl text-brand">404</p>
      <h1 className="mt-4 text-3xl text-ink">{t.notFound.title}</h1>
      <p className="mt-3 text-muted-ink">{t.notFound.body}</p>
      <Link href="/" className="btn-primary mt-8">
        {t.notFound.back}
      </Link>
    </section>
  )
}
