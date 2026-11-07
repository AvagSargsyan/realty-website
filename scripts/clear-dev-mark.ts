/**
 * Removes the "dev" marker Payload writes when it syncs a database schema in development mode
 * (a payload_migrations row named "dev" with batch -1). While it exists, `payload migrate` stops to
 * ask "data loss will occur, proceed?", which fails non-interactive deploys.
 *
 *   pnpm db:clear-dev-mark:staging   -> the database in .env.staging
 *
 * Only removes that marker; tables and data are untouched. Afterwards the next deploy's
 * `payload migrate` applies any migrations that are still missing.
 */
import { config as loadEnv } from 'dotenv'

const target = process.env.DB_ENV
if (!target) throw new Error('Set DB_ENV (e.g. staging) to choose the .env file')
const loaded = loadEnv({ path: `.env.${target}`, override: true })
if (loaded.error) throw new Error(`Could not read .env.${target}: ${loaded.error.message}`)

const url = new URL(process.env.DATABASE_URL ?? '')
if (['localhost', '127.0.0.1', '::1'].includes(url.hostname)) {
  console.error(`.env.${target} points at this machine; nothing to do for a remote database. Nothing was changed.`)
  process.exit(1)
}
console.log(`\nDatabase: ${url.hostname}${url.pathname}`)

// Don't let this script push the schema itself (that would write the marker again)
process.env.PAYLOAD_DB_PUSH = 'false'
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const before = await payload.find({ collection: 'payload-migrations', limit: 100, pagination: false, sort: 'createdAt' })
console.log('Recorded migrations:', before.docs.map((m) => `${m.name} (batch ${m.batch})`).join(', ') || 'none')

const removed = await payload.delete({ collection: 'payload-migrations', where: { batch: { equals: -1 } } })
console.log(removed.docs.length ? `Removed the dev marker (${removed.docs.length} row).` : 'No dev marker found; nothing to remove.')
process.exit(0)
