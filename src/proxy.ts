import { NextResponse, type NextRequest } from 'next/server'

import { DEFAULT_LOCALE, isLocale, LOCALES } from '@/i18n/config'
import type { Lang } from '@/types'

/** Language for a visitor who opened a URL without one: their saved choice, then the browser's, then Armenian. */
function pickLocale(request: NextRequest): Lang {
  const saved = request.cookies.get('avenue.lang')?.value
  if (saved && isLocale(saved)) return saved

  // "ru-RU,ru;q=0.9,en;q=0.8" -> the first supported language in the visitor's order of preference
  const accepted = (request.headers.get('accept-language') ?? '')
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=')
      return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)
  return (accepted.find((a) => isLocale(a.lang))?.lang as Lang | undefined) ?? DEFAULT_LOCALE
}

/** Every public page lives under /hy, /en or /ru. Anything else is redirected there, keeping the path and query. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const first = pathname.split('/')[1]
  if ((LOCALES as readonly string[]).includes(first)) return

  const url = request.nextUrl.clone()
  url.pathname = `/${pickLocale(request)}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  // Skip Payload (/admin, /api), Next internals and files with an extension (favicon.svg, robots.txt ...)
  matcher: ['/((?!admin|api|_next|.*\\..*).*)'],
}
