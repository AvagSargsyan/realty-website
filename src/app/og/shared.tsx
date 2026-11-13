import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Shared parts of the generated share images (Open Graph, 1200×630).
 * Fonts: ImageResponse can't read woff2, so assets/og-fonts holds woff copies of the site's Manrope
 * (Latin + Cyrillic) and Noto Sans Armenian, bold weights only (SIL Open Font License, see the folder).
 * next.config.ts includes that folder in the /og functions.
 */

const font = (file: string) => readFile(join(process.cwd(), 'assets/og-fonts', file))

const [latin7, latin8, cyr7, cyr8, arm7, arm8] = await Promise.all([
  font('manrope-latin-700-normal.woff'),
  font('manrope-latin-800-normal.woff'),
  font('manrope-cyrillic-700-normal.woff'),
  font('manrope-cyrillic-800-normal.woff'),
  font('noto-sans-armenian-armenian-700-normal.woff'),
  font('noto-sans-armenian-armenian-800-normal.woff'),
])

/** Glyphs missing in one font are taken from the next, so all three scripts render. */
export const OG_FONTS = [
  { name: 'Manrope', data: latin7, weight: 700 as const, style: 'normal' as const },
  { name: 'Manrope', data: latin8, weight: 800 as const, style: 'normal' as const },
  { name: 'Manrope', data: cyr7, weight: 700 as const, style: 'normal' as const },
  { name: 'Manrope', data: cyr8, weight: 800 as const, style: 'normal' as const },
  { name: 'Noto Sans Armenian', data: arm7, weight: 700 as const, style: 'normal' as const },
  { name: 'Noto Sans Armenian', data: arm8, weight: 800 as const, style: 'normal' as const },
]

export const OG_SIZE = { width: 1200, height: 630 }

/** Served from the CDN for a day, refreshed in the background for a week (URLs change after edits anyway). */
export const OG_HEADERS = { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' }

export const COLORS = { ink: '#0b1f27', iris: '#0c4a60', orange: '#ea8435', white: '#ffffff', mist: '#c8d7dc' }

/** The Avenue logo (roof + letters) as shapes, same geometry as components/layout/Logo.tsx. */
export function LogoMark({ width = 300, color = COLORS.white }: { width?: number; color?: string }) {
  return (
    <svg width={width} height={(width * 46) / 100} viewBox="0 0 100 46">
      <g fill={COLORS.orange}>
        <polygon points="33,0 44,12 22,12" />
        <polygon points="37,0 59,0 77,22 56,22" />
      </g>
      <g fill={color}>
        <polygon points="6,28 9.6,28 3.6,45 0,45" />
        <polygon points="7.4,28 11,28 17,45 13.4,45" />
        <rect x="2.6" y="38" width="11.8" height="2.2" />
        <polygon points="17,28 20.6,28 25.1,40.8 30.4,28 34,28 27,45 23,45" />
        <polygon points="35,28 48,28 48,31 40,31 40,35 47,35 47,37.6 40,37.6 40,42 48,42 48,45 35,45" />
        <polygon points="51,28 55.3,28 63,39.8 63,28 66,28 66,45 62,45 54,33.4 54,45 51,45" />
        <path d="M70 28h4v11.2c0 1.9 1.2 2.9 3 2.9s3-1 3-2.9V28h4v11.4c0 3.9-2.6 5.6-7 5.6s-7-1.7-7-5.6Z" />
        <polygon points="87,28 100,28 100,31 92,31 92,35 99,35 99,37.6 92,37.6 92,42 100,42 100,45 87,45" />
      </g>
    </svg>
  )
}
