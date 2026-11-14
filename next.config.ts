import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  // The share-image routes read these fonts from disk (src/app/og/shared.tsx)
  outputFileTracingIncludes: { '/og/**': ['./assets/og-fonts/**'] },
  // No "X-Powered-By: Next.js" header (tells attackers which framework to look up)
  poweredByHeader: false,
  async headers() {
    // Basic browser protections on every response. X-Frame-Options is SAMEORIGIN, not DENY: the admin
    // shows the live preview of a listing in an iframe from this same site. (Vercel adds HSTS itself.)
    const security = {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
      ],
    }
    // Only production may be indexed: staging and local send `noindex` on every response. In production
    // the admin and the API still say noindex (robots.txt only asks crawlers not to visit them).
    if (process.env.VERCEL_ENV === 'production') {
      return [security, ...['/admin/:path*', '/api/:path*'].map((source) => ({ source, headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }))]
    }
    return [security, { source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
