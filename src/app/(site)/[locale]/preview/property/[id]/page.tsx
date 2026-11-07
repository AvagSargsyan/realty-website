import config from '@payload-config'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { LivePreviewProperty } from '@/components/property/LivePreviewProperty'
import { isLocale } from '@/i18n/config'

// Per request, for signed-in staff only; never cached or indexed
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { robots: { index: false, follow: false } }

/**
 * Target of the admin's Live Preview (Properties → a listing → Live Preview). Shows any listing,
 * drafts included, to users signed in to the admin; everyone else gets a 404.
 */
export default async function PropertyPreviewPage({ params }: PageProps<'/[locale]/preview/property/[id]'>) {
  const { locale, id } = await params
  if (!isLocale(locale)) notFound()

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) notFound()

  const doc = await payload
    .findByID({ collection: 'properties', id: Number(id), locale, fallbackLocale: 'hy', depth: 1, user, overrideAccess: false })
    .catch(() => null)
  if (!doc) notFound()

  return <LivePreviewProperty initial={doc} />
}
