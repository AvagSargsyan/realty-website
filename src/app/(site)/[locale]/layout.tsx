import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { Footer } from '@/components/layout/Footer'
import { Header, HeaderWithSearch } from '@/components/layout/Header'
import { NavigationProgress } from '@/components/providers/navigation-progress'
import { SettingsProvider } from '@/components/providers/SettingsProvider'
import { ThemeSync } from '@/components/providers/ThemeSync'
import { ToastProvider } from '@/components/ui/toast'
import { THEME_COLORS, THEME_SCRIPT } from '@/lib/theme'
import { LocaleProvider } from '@/i18n/client'
import { isLocale, LOCALES } from '@/i18n/config'
import { DICTS } from '@/i18n/dictionaries'
import { agencyJsonLd } from '@/lib/json-ld'
import { jsonLdScript, SITE_NAME, SITE_URL } from '@/lib/seo'
import { getSiteSettings } from '@/lib/settings'
import '../globals.css'

// Every page under /hy, /en and /ru is prerendered per language. Other locales get a 404 from the
// isLocale check below. Not `dynamicParams = false`: with it, a page whose cache the admin cleared
// (revalidatePath) answered 404 instead of being rendered again.
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

/** Defaults for every page; pages set their own title, canonical and Open Graph through pageMetadata (src/lib/seo.ts). */
export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: 'Avenue Real Estate Agency', template: `%s · ${SITE_NAME}` },
    description: isLocale(locale) ? DICTS[locale].footer.tagline : undefined,
    icons: { icon: '/favicon.svg' },
  }
}

export const viewport: Viewport = { themeColor: THEME_COLORS.light }

export default async function SiteLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const settings = await getSiteSettings(locale)

  return (
    // The theme script may add `dark` before React hydrates
    <html lang={locale} suppressHydrationWarning>
      {/* No <head> element of our own: Next fills it from the metadata. With a React-rendered <head>
          (it held the theme script) React sometimes lost its place when it switched from <head> to
          <body> while restarting hydration on slow networks, matched body elements to the wrong nodes
          and threw hydration error #418 on about 1 in 5 page loads (production builds only). */}
      <body>
        {/* Theme before the first paint: a blocking inline script at the very start of <body> runs before
            any content is drawn, so a dark theme never flashes light. React warns in dev when the layout
            re-renders on a language switch; harmless, ThemeSync covers that case. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <LocaleProvider locale={locale}>
          <SettingsProvider value={settings}>
            <ToastProvider>
              <ThemeSync />
              <NavigationProgress />
              <div className="flex min-h-svh flex-col">
                <Suspense fallback={<Header />}>
                  <HeaderWithSearch />
                </Suspense>
                <main id="main" className="flex-1">
                  {children}
                </main>
                <Footer />
                {/* Inside this <div>, not directly in <body>: see the note on <head> above */}
                <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(agencyJsonLd(locale, settings))} />
              </div>
            </ToastProvider>
          </SettingsProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
