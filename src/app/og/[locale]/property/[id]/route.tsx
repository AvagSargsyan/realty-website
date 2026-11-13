import { ImageResponse } from 'next/og'

import { isLocale } from '@/i18n/config'
import { DICTS } from '@/i18n/dictionaries'
import { formatNumber, formatPrice } from '@/lib/format'
import { getPropertyByCode } from '@/lib/listings'

import { COLORS, LogoMark, OG_FONTS, OG_HEADERS, OG_SIZE } from '../../../shared'

/** The cover photo as a data URL (ImageResponse reads JPEG/PNG; the `og` size is a 1200×630 JPEG). */
async function coverDataUrl(src: string | undefined, origin: string) {
  if (!src) return null
  try {
    const res = await fetch(new URL(src, origin))
    if (!res.ok) return null
    const type = res.headers.get('content-type') ?? 'image/jpeg'
    if (!/jpe?g|png/.test(type)) return null
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`
  } catch {
    return null
  }
}

/**
 * A listing's share image (/og/en/property/422001): cover photo with the price, deal, area and district.
 * The page links it with ?v=<last edit>, so a changed price gets a new image.
 */
export async function GET(req: Request, { params }: RouteContext<'/og/[locale]/property/[id]'>) {
  const { locale, id } = await params
  if (!isLocale(locale)) return new Response('Not found', { status: 404 })
  const l = await getPropertyByCode(locale, Number(id))
  if (!l) return new Response('Not found', { status: 404 })

  const t = DICTS[locale]
  const photo = await coverDataUrl(l.photos[0]?.og ?? l.photos[0]?.card, new URL(req.url).origin)
  // Only USD here: the image is shared once, while visitors choose their currency on the site
  const price = `${formatPrice(l.priceUsd, 'USD', locale, { USD: 1, AMD: 1, RUB: 1 })}${l.deal === 'rent' ? ` ${t.card.perMonth}` : ''}`
  const facts = [t.type[l.type], `${formatNumber(l.area, locale)} ${t.units.sqm}`, ...(l.rooms > 0 ? [t.card.rooms(l.rooms)] : []), l.district.name]

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: COLORS.ink, fontFamily: 'Manrope, Noto Sans Armenian' }}>
        {photo && (
          <img src={photo} alt="" width={1200} height={630} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        {/* Dark band at the bottom so the text reads on any photo */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 360,
            background: 'linear-gradient(to bottom, rgba(11,31,39,0) 0%, rgba(11,31,39,0.85) 55%, rgba(11,31,39,0.95) 100%)',
          }}
        />
        <div style={{ position: 'absolute', top: 40, left: 48, display: 'flex', padding: '14px 20px', borderRadius: 14, background: 'rgba(11,31,39,0.78)' }}>
          <LogoMark width={170} />
        </div>
        <div style={{ position: 'absolute', left: 56, right: 56, bottom: 48, display: 'flex', flexDirection: 'column', color: COLORS.white }}>
          <div style={{ display: 'flex', fontSize: 26, fontWeight: 800, letterSpacing: 3, color: COLORS.orange, textTransform: 'uppercase' }}>{t.deal[l.deal]}</div>
          <div style={{ display: 'flex', fontSize: 76, fontWeight: 800, lineHeight: 1.05, marginTop: 8 }}>{price}</div>
          <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, marginTop: 14, color: COLORS.mist }}>{facts.join('  ·  ')}</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: OG_FONTS, headers: OG_HEADERS },
  )
}
