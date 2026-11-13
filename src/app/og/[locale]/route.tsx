import { ImageResponse } from 'next/og'

import { isLocale } from '@/i18n/config'
import { DICTS } from '@/i18n/dictionaries'

import { COLORS, LogoMark, OG_FONTS, OG_HEADERS, OG_SIZE } from '../shared'

/** The site's default share image (/og/hy, /og/en, /og/ru): logo and tagline on the brand colour. */
export async function GET(_req: Request, { params }: RouteContext<'/og/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) return new Response('Not found', { status: 404 })
  const t = DICTS[locale]
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: `linear-gradient(135deg, ${COLORS.ink} 0%, ${COLORS.iris} 100%)`,
          fontFamily: 'Manrope, Noto Sans Armenian',
          color: COLORS.white,
        }}
      >
        <LogoMark width={320} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1, maxWidth: 960 }}>{t.home.hero.title}</div>
          <div style={{ fontSize: 30, fontWeight: 700, color: COLORS.mist, maxWidth: 960 }}>{t.footer.tagline}</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: OG_FONTS, headers: OG_HEADERS },
  )
}
