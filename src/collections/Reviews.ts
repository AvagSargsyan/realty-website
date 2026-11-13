import type { CollectionConfig } from 'payload'

import { isEditor } from './shared/access'
import { label } from './shared/labels'
import { revalidateSite } from '../lib/revalidate'

/**
 * Client reviews for the home page. Drag rows in the list to change their order; the first three
 * published ones are shown. The rating and review count next to the title are in Settings → Home page.
 */
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: {
    singular: label('Review', 'Կարծիք', 'Отзыв'),
    plural: label('Reviews', 'Կարծիքներ', 'Отзывы'),
  },
  orderable: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'rating', 'published'],
    group: label('Clients', 'Հաճախորդներ', 'Клиенты'),
  },
  // Visitors only see published reviews
  access: {
    read: ({ req }) => (req.user ? true : { published: { equals: true } }),
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  hooks: { afterChange: [() => revalidateSite()], afterDelete: [() => revalidateSite()] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, localized: true, label: label('Name', 'Անուն', 'Имя') },
        {
          name: 'role',
          type: 'text',
          localized: true,
          label: label('Line under the name', 'Տող անվան տակ', 'Строка под именем'),
          admin: { description: label('E.g. "Bought a 3-room apartment in Arabkir"', 'Օր.՝ «Գնել է 3 սենյականոց բնակարան Արաբկիրում»', 'Напр. «Купила 3-комнатную квартиру в Арабкире»') },
        },
      ],
    },
    { name: 'text', type: 'textarea', required: true, localized: true, label: label('Review', 'Կարծիք', 'Отзыв') },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      defaultValue: 5,
      label: label('Stars (1–5)', 'Աստղեր (1–5)', 'Звёзды (1–5)'),
      admin: { position: 'sidebar', step: 1 },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      label: label('Show on the website', 'Ցուցադրել կայքում', 'Показывать на сайте'),
      admin: { position: 'sidebar' },
    },
  ],
}
