import type { MetadataRoute } from 'next'

import { absolute, IS_INDEXABLE } from '@/lib/seo'

/**
 * Production: crawl the site, not the admin, the API, saved lists or previews. Filter pages with many
 * options stay crawlable (their links lead to listings) but say noindex themselves (listings/page.tsx).
 * Staging and local: nothing may be crawled.
 */
export default function robots(): MetadataRoute.Robots {
  if (!IS_INDEXABLE) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/og', '/*/favorites', '/*/preview'] },
    sitemap: absolute('/sitemap.xml'),
  }
}
