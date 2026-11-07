import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { Footer } from '@/components/layout/Footer'
import { Header, HeaderWithSearch } from '@/components/layout/Header'
import { SettingsProvider } from '@/components/providers/SettingsProvider'
import { ThemeSync } from '@/components/providers/ThemeSync'
import { ToastProvider } from '@/components/ui/toast'
import { THEME_COLORS, THEME_SCRIPT } from '@/components/providers/preferences'
import { LocaleProvider } from '@/i18n/client'
import { isLocale, LOCALES } from '@/i18n/config'
import { getSiteSettings } from '@/lib/settings'
import '../globals.css'

// Only /hy, /en and /ru exist; every page under them is prerendered per language.
export const dynamicParams = false
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: { default: 'Avenue Real Estate Agency', template: '%s · Avenue Real Estate' },
  description: 'Buy, sell and rent property in Yerevan.',
  icons: { icon: '/favicon.svg' },
}

export const viewport: Viewport = { themeColor: THEME_COLORS.light }

export default async function SiteLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const settings = await getSiteSettings(locale)

  return (
    // The theme script may add `dark` before React hydrates
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* A plain inline script (not next/script, which doesn't block paint), per Next's "Preventing flash"
            guide. React warns in dev when the layout re-renders on a language switch; harmless, ThemeSync
            covers that case. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <LocaleProvider locale={locale}>
          <SettingsProvider value={settings}>
            <ToastProvider>
              <ThemeSync />
              <div className="flex min-h-svh flex-col">
                <Suspense fallback={<Header />}>
                  <HeaderWithSearch />
                </Suspense>
                <main id="main" className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </ToastProvider>
          </SettingsProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
