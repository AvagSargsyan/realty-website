/**
 * Fills a database with sample content: 12 districts, 3 agents and 50 published listings with photos.
 *
 *   pnpm seed                 -> the database in .env.local (your Docker Postgres)
 *   pnpm seed --env=staging   -> the database and Blob store in .env.staging (see README)
 *
 * Safe to re-run: districts, agents, photos and listings are matched by key / email / file name /
 * code and updated instead of duplicated.
 */
import { config as loadEnv } from 'dotenv'

import { AGENTS, DISTRICTS, POOL_ALT, type PhotoPool } from './data'
import { DEMO, generateListings, type SampleListing } from './generate'

const LOCALES = ['hy', 'en', 'ru'] as const
type Locale = (typeof LOCALES)[number]

// ---------- Which database ----------
const envArg = process.argv.find((a) => a.startsWith('--env='))?.slice(6)
if (envArg) {
  // Overrides what `payload run` loaded from .env.local
  const result = loadEnv({ path: `.env.${envArg}`, override: true })
  if (result.error) throw new Error(`Could not read .env.${envArg}: ${result.error.message}`)
}
const dbUrl = new URL(process.env.DATABASE_URL ?? '')
const target = `${dbUrl.hostname}${dbUrl.pathname}`
const storage = process.env.BLOB_READ_WRITE_TOKEN ? 'Vercel Blob' : 'local /media folder'
console.log(`\nSeeding ${target} (photos: ${storage})\n`)

// Imported after the env is final: the config reads DATABASE_URL and the Blob token on import
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

// The demo's 30 listings plus 20 more from a second run of the same generator
const EXTRA = {
  seed: 20261107,
  startId: 422200,
  mix: [
    ['sale', 'apartment', 8],
    ['sale', 'house', 3],
    ['sale', 'commercial', 2],
    ['sale', 'land', 1],
    ['rent', 'apartment', 5],
    ['rent', 'commercial', 1],
  ],
} satisfies typeof DEMO
const listings: SampleListing[] = [...generateListings(DEMO), ...generateListings(EXTRA)]

/** Create or update one document in every locale: `fields(locale)` returns that locale's values. */
async function upsert<C extends 'districts' | 'agents' | 'properties'>(
  collection: C,
  where: Record<string, { equals: unknown }>,
  fields: (locale: Locale) => Record<string, unknown>,
): Promise<number> {
  const existing = await payload.find({ collection, where, limit: 1, depth: 0 })
  let id = existing.docs[0]?.id as number | undefined
  for (const locale of LOCALES) {
    const data = fields(locale) as never
    if (id === undefined) id = (await payload.create({ collection, data, locale, depth: 0 })).id as number
    else await payload.update({ collection, id, data, locale, depth: 0 })
  }
  return id!
}

// ---------- Districts ----------
const districtIds: Record<string, number> = {}
for (const [order, d] of DISTRICTS.entries()) {
  districtIds[d.key] = await upsert('districts', { key: { equals: d.key } }, (l) => ({
    key: d.key,
    region: d.region,
    order,
    name: d.name[l],
  }))
}
console.log(`✓ ${DISTRICTS.length} districts`)

// ---------- Agents ----------
const agentIds: number[] = []
for (const a of AGENTS) {
  agentIds.push(
    await upsert('agents', { email: { equals: a.email } }, (l) => ({
      email: a.email,
      phone: a.phone,
      whatsapp: a.whatsapp,
      languages: [...a.languages],
      name: a.name[l],
    })),
  )
}
console.log(`✓ ${AGENTS.length} agents`)

// ---------- Photos ----------
const photoPools = new Map<string, PhotoPool>()
for (const l of listings) for (const p of l.photos) photoPools.set(p.id, p.pool)

const mediaIds = new Map<string, number>()
let downloaded = 0

async function ensurePhoto(unsplashId: string, pool: PhotoPool) {
  const name = `unsplash-${unsplashId}`
  const found = await payload.find({ collection: 'media', where: { filename: { like: name } }, limit: 1, depth: 0 })
  if (found.docs[0]) return mediaIds.set(unsplashId, found.docs[0].id)

  // About 1600 px JPEG; Payload converts it to WebP and makes the four sizes on upload
  const res = await fetch(`https://images.unsplash.com/${unsplashId}?fm=jpg&fit=crop&w=1600&q=80`, {
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`Download failed for ${unsplashId}: HTTP ${res.status}`)
  const data = Buffer.from(await res.arrayBuffer())

  const alt = POOL_ALT[pool]
  const doc = await payload.create({
    collection: 'media',
    data: { alt: alt.hy },
    locale: 'hy',
    file: { data, mimetype: 'image/jpeg', name: `${name}.jpg`, size: data.length },
    depth: 0,
  })
  for (const locale of ['en', 'ru'] as const) {
    await payload.update({ collection: 'media', id: doc.id, data: { alt: alt[locale] }, locale, depth: 0 })
  }
  mediaIds.set(unsplashId, doc.id)
  downloaded++
}

// A few at a time: quick, without hammering Unsplash or the database
const queue = [...photoPools.entries()]
await Promise.all(
  Array.from({ length: 4 }, async () => {
    for (let next = queue.shift(); next; next = queue.shift()) {
      await ensurePhoto(next[0], next[1])
      process.stdout.write(`\r  photos: ${mediaIds.size}/${photoPools.size}`)
    }
  }),
)
console.log(`\n✓ ${photoPools.size} photos (${downloaded} downloaded, ${photoPools.size - downloaded} already there)`)

// ---------- Listings ----------
for (const [i, l] of listings.entries()) {
  await upsert('properties', { code: { equals: l.code } }, (locale) => ({
    code: l.code,
    status: 'published',
    deal: l.deal,
    type: l.type,
    tags: l.tags,
    title: l.title[locale],
    district: districtIds[l.district],
    street: l.street[locale],
    description: l.description[locale],
    priceUsd: l.priceUsd,
    oldPriceUsd: l.oldPriceUsd ?? null,
    area: l.area,
    ...(l.type === 'land'
      ? {}
      : {
          rooms: l.rooms,
          bedrooms: l.bedrooms,
          bathrooms: l.bathrooms,
          floor: l.floor,
          floors: l.floors,
          ceiling: l.ceiling,
          building: l.building,
          condition: l.condition,
        }),
    amenities: l.amenities,
    photos: l.photos.map((p) => mediaIds.get(p.id)!),
    agent: agentIds[i % agentIds.length],
  }))
  process.stdout.write(`\r  listings: ${i + 1}/${listings.length}`)
}
console.log(`\n✓ ${listings.length} listings\n\nDone.`)
process.exit(0)
