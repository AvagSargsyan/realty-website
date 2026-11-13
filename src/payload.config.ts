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

import { Agents } from './collections/Agents'
import { Districts } from './collections/Districts'
import { Leads } from './collections/Leads'
import { Media } from './collections/Media'
import { Properties } from './collections/Properties'
import { Users } from './collections/Users'
import { HomePage } from './globals/HomePage'
import { Pages } from './globals/Pages'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// No `serverURL` on purpose: the admin then calls the API with relative paths, so it works on
// whichever address it is opened (branch URL, deployment URL, localhost). A fixed address made
// the browser send uploads to a different host, where CORS and the login cookies block them.
export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · Avenue admin',
    },
  },
  // Order = order in the admin sidebar
  collections: [Properties, Districts, Agents, Media, Leads, Users],
  globals: [HomePage, Pages, SiteSettings],
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
    // In development Payload also "pushes" changes straight into the database and marks it as a
    // dev database; `payload migrate` then refuses to run on it. That's fine for the local Docker
    // database, never for staging or production: scripts that run against those (the seed) set
    // PAYLOAD_DB_PUSH=false.
    push: process.env.PAYLOAD_DB_PUSH === 'false' ? false : undefined,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      // Without a token (local development) uploads fall back to the /media folder
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      token: process.env.BLOB_READ_WRITE_TOKEN,
      // Media is public, so file URLs point straight at the Blob CDN instead of /api/media/file/...
      // (which would stream every image through our serverless function).
      collections: { media: { disablePayloadAccessControl: true } },
      // Same database columns with or without Blob, so migrations match everywhere
      alwaysInsertFields: true,
      addRandomSuffix: true,
      // Browser uploads straight to Blob, bypassing Vercel's 4.5 MB request limit
      clientUploads: true,
    }),
  ],
})
