import type { CollectionConfig } from 'payload'

/**
 * Photos. Fixed sizes are generated once at upload (sharp) and served directly,
 * so the site never uses Vercel's monthly image-optimisation quota.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'alt',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
    },
  ],
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    // Downscale huge originals to save storage (Vercel Blob free allowance)
    resizeOptions: { width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true },
    formatOptions: { format: 'webp', options: { quality: 82 } },
    focalPoint: true,
    imageSizes: [
      { name: 'thumb', width: 480, formatOptions: { format: 'webp', options: { quality: 78 } } },
      { name: 'card', width: 800, formatOptions: { format: 'webp', options: { quality: 78 } } },
      { name: 'large', width: 1600, formatOptions: { format: 'webp', options: { quality: 80 } } },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
        formatOptions: { format: 'jpeg', options: { quality: 80 } },
      },
    ],
    adminThumbnail: 'thumb',
  },
}
