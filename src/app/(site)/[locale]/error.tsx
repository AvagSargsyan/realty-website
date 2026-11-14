'use client'

import { useEffect } from 'react'

import { Link, useT } from '@/i18n/client'

/**
 * Shown inside the site layout (header and footer stay) when a page fails to render, e.g. the database
 * is briefly unreachable. "Try again" re-fetches and re-renders the page. Errors in the layout itself
 * go to src/app/global-error.tsx.
 */
export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  const { t } = useT()
  useEffect(() => {
    // Visible in the browser console; the server log has the details under the same digest
    console.error(error)
  }, [error])
  return (
    <section className="container-page flex min-h-[55vh] flex-col items-center justify-center py-24 text-center">
      <title>{`${t.error.title} · Avenue Real Estate`}</title>
      <h1 className="text-3xl text-ink">{t.error.title}</h1>
      <p className="mt-3 max-w-md text-muted-ink">{t.error.body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className="btn-primary">
          {t.error.retry}
        </button>
        <Link href="/" className="btn-secondary">
          {t.error.back}
        </Link>
      </div>
    </section>
  )
}
