import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Public pages are prerendered and listing queries are cached. After content changes in the admin,
 * clear both so the next visitor gets fresh content. `expire: 0` makes that next request wait for
 * fresh data instead of being served the old version once.
 * Outside a Next.js server (seed script, migrations) there is nothing to clear and these throw,
 * so errors are ignored.
 */
export function revalidateSite() {
  try {
    revalidateTag('listings', { expire: 0 })
    revalidatePath('/', 'layout')
  } catch {
    /* not running inside Next.js */
  }
}
