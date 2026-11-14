/**
 * Prepares an empty production database before the first deploy: applies the migrations and creates
 * the first admin account. Without it, the first person to open /admin on a fresh database gets
 * Payload's public "create first user" form, and that account becomes an admin.
 *
 *   ADMIN_EMAIL=you@example.com pnpm admin:create:live   -> the database in .env.live
 *
 * The password is generated here and printed once, only in your terminal. Sign in with it and change
 * it in the admin (Account). Refuses to run on a database that already has users.
 * `.env.live`, not `.env.production`: Next loads `.env.production` automatically for local production
 * builds, which would point them at the real database.
 */
import { randomBytes } from 'node:crypto'

import { config as loadEnv } from 'dotenv'

const target = process.env.DB_ENV
if (!target) throw new Error('Set DB_ENV (e.g. live) to choose the .env file')
const loaded = loadEnv({ path: `.env.${target}`, override: true })
if (loaded.error) throw new Error(`Could not read .env.${target}: ${loaded.error.message}`)

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error('Set ADMIN_EMAIL to the email you will sign in with, e.g. ADMIN_EMAIL=you@example.com. Nothing was changed.')
  process.exit(1)
}
if (!process.env.PAYLOAD_SECRET) {
  console.error(`.env.${target} must set PAYLOAD_SECRET (the same value as in Vercel). Nothing was changed.`)
  process.exit(1)
}
const url = new URL(process.env.DATABASE_URL ?? '')
console.log(`\nDatabase: ${url.hostname}${url.pathname}`)

// Never sync the schema from a script: migrations alone shape shared databases
process.env.PAYLOAD_DB_PUSH = 'false'
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

console.log('Applying migrations...')
await payload.db.migrate()

const users = await payload.count({ collection: 'users' })
if (users.totalDocs > 0) {
  console.error(`This database already has ${users.totalDocs} user(s). Add more in the admin (Settings → Users). Nothing was created.`)
  process.exit(1)
}

const password = randomBytes(18).toString('base64url')
await payload.create({ collection: 'users', data: { email, password, role: 'admin', name: 'Admin' } })
console.log(`\nAdmin created: ${email}\nPassword (shown once, change it after signing in): ${password}\n`)
process.exit(0)
