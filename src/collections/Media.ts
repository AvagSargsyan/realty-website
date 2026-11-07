import type { CollectionConfig } from 'payload'

import { anyone, isEditor, isStaff } from './shared/access'
import { label } from './shared/labels'

/**
 * Photos. Fixed sizes are generated once at upload (sharp) and served directly,
 * so the site never uses Vercel's monthly image-optimisation quota.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: label('Photo', 'Լուսանկար', 'Фото'),
    plural: label('Media', 'Մեդիա', 'Медиа'),
  },
  access: {
    read: anyone,
    // Any staff member can upload (agents add photos to their listings)
    create: isStaff,
    update: isStaff,
    delete: isEditor,
  },
  admin: {
    useAsTitle: 'alt',
    group: label('Listings', 'Գույք', 'Объекты'),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      label: label('Description (alt text)', 'Նկարագրություն (alt)', 'Описание (alt)'),
      admin: {
        description: label(
          'What the photo shows, for screen readers and search engines',
          'Ինչ է պատկերված՝ էկրանի ընթերցիչների և որոնողական համակարգերի համար',
          'Что на фото — для экранных дикторов и поисковиков',
        ),
      },
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
