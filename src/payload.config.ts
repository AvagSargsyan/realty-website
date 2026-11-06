import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { en } from '@payloadcms/translations/languages/en'
import { hy } from '@payloadcms/translations/languages/hy'
import { ru } from '@payloadcms/translations/languages/ru'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/** Public URL: set by hand locally; on Vercel it comes from the system variables. */
function serverURL() {
  if (process.env.NEXT_PUBLIC_SERVER_URL) return process.env.NEXT_PUBLIC_SERVER_URL
  const host =
    process.env.VERCEL_ENV === 'production'
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL
  return host ? `https://${host}` : ''
}

export default buildConfig({
  serverURL: serverURL(),
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · Avenue admin',
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Admin interface languages (each editor picks one in their account)
  i18n: {
    supportedLanguages: { hy, en, ru },
    fallbackLanguage: 'en',
  },
  // Content languages: Armenian is the default; empty en/ru fields fall back to it
  localization: {
    locales: [
      { code: 'hy', label: 'Հայերեն' },
      { code: 'en', label: 'English' },
      { code: 'ru', label: 'Русский' },
    ],
    defaultLocale: 'hy',
    fallback: true,
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Schema changes go through committed migrations (src/migrations).
    // In development Payload still "pushes" changes automatically; production never does.
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      // Without a token (local development) uploads fall back to the /media folder
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      token: process.env.BLOB_READ_WRITE_TOKEN,
      collections: { media: true },
      // Same database columns with or without Blob, so migrations match everywhere
      alwaysInsertFields: true,
      addRandomSuffix: true,
      // Browser uploads straight to Blob, bypassing Vercel's 4.5 MB request limit
      clientUploads: true,
    }),
  ],
})
