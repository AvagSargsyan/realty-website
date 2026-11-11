import 'server-only'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Lang } from '@/types'

/** What the site's components need from the Site settings global, in plain values. */
export type SiteSettings = {
  phone: string
  phoneHref: string
  whatsappHref: string
  email: string
  address: string
  hours: string
  socials: { facebook?: string; instagram?: string; telegram?: string }
  rates: { USD: number; AMD: number; RUB: number }
}

/** Cache tag cleared when the admin saves anything (see revalidateSite). */
export const SETTINGS_TAG = 'site-settings'

/**
 * Loaded once per request (React cache) and kept in the Data Cache between requests, so pages
 * rendered per request (listings) don't query the database for it every time.
 */
export const getSiteSettings = cache(
  unstable_cache(loadSiteSettings, ['site-settings'], { tags: [SETTINGS_TAG], revalidate: 3600 }),
)

async function loadSiteSettings(locale: Lang): Promise<SiteSettings> {
  const payload = await getPayload({ config })
  const s = await payload.findGlobal({ slug: 'site-settings', locale, depth: 0 })
  return {
    phone: s.phone,
    phoneHref: `tel:${s.phone.replace(/[^\d+]/g, '')}`,
    whatsappHref: `https://wa.me/${s.whatsapp}`,
    email: s.email,
    address: s.address,
    hours: s.hours ?? '',
    socials: {
      facebook: s.socials?.facebook || undefined,
      instagram: s.socials?.instagram || undefined,
      telegram: s.socials?.telegram || undefined,
    },
    rates: { USD: 1, AMD: s.rates.amd, RUB: s.rates.rub },
  }
}
