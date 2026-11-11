import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Public pages are prerendered and their data is cached (src/lib/listings.ts, src/lib/settings.ts).
 * After content changes in the admin, clear both so the next visitor gets fresh content.
 * `expire: 0` makes that next request wait for fresh data instead of being served the old version once.
 * Outside a Next.js server (seed script, migrations) there is nothing to clear and these throw,
 * so errors are ignored.
 * The tags are plain strings here: importing them would pull server-only modules into the Payload config.
 */
export function revalidateSite() {
  try {
    revalidateTag('listings', { expire: 0 })
    revalidateTag('site-settings', { expire: 0 })
    revalidatePath('/', 'layout')
  } catch {
    /* not running inside Next.js */
  }
}
