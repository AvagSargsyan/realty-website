'use client'

import { Link, useT } from '@/i18n/client'

/** Unknown, unpublished or removed listing (ported from the demo's PropertyNotFound). */
export default function PropertyNotFound() {
  const { t } = useT()
  return (
    <section className="container-page flex min-h-[55vh] flex-col items-center justify-center py-24 text-center">
      <title>{`${t.property.notFound.title} · Avenue Real Estate`}</title>
      <h1 className="text-3xl font-extrabold text-ink">{t.property.notFound.title}</h1>
      <p className="mt-3 text-muted-ink">{t.property.notFound.body}</p>
      <Link href="/listings" className="btn-primary mt-8">
        {t.property.notFound.back}
      </Link>
    </section>
  )
}
