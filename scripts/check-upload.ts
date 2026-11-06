/**
 * Week-1 check: uploads a generated 3000×2000 photo through the Payload Local API,
 * prints the stored size and the generated image sizes, then deletes it.
 * Works with local disk storage and with Vercel Blob (when BLOB_READ_WRITE_TOKEN is set).
 *
 *   pnpm payload run scripts/check-upload.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'
import sharp from 'sharp'

async function main() {
  const payload = await getPayload({ config })
  const data = await sharp({
    create: { width: 3000, height: 2000, channels: 3, background: { r: 12, g: 74, b: 96 } },
  })
    .jpeg()
    .toBuffer()

  const doc = await payload.create({
    collection: 'media',
    data: { alt: 'Upload check' },
    file: { data, mimetype: 'image/jpeg', name: 'upload-check.jpg', size: data.length },
  })

  console.log(`stored: ${doc.filename} ${doc.width}x${doc.height} ${doc.mimeType} → ${doc.url}`)
  for (const [name, size] of Object.entries(doc.sizes ?? {})) {
    console.log(`  ${name}: ${size?.width}x${size?.height} ${size?.mimeType}`)
  }

  await payload.delete({ collection: 'media', id: doc.id })
  console.log('deleted the test photo')
  process.exit(0)
}

// `payload run` exits as soon as the module has loaded, so wait for main() at the top level
await main().catch((err) => {
  console.error(err)
  process.exit(1)
})
