import { revalidatePath } from 'next/cache'

/**
 * Public pages are prerendered. After content changes in the admin, clear the cached pages so the
 * next visitor gets fresh HTML. Outside a Next.js server (seed script, migrations) there is nothing
 * to clear and revalidatePath throws, so errors are ignored.
 */
export function revalidateSite() {
  try {
    revalidatePath('/', 'layout')
  } catch {
    /* not running inside Next.js */
  }
}
