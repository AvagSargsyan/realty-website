import type { CollectionConfig } from 'payload'

import { anyone, isAdmin, isEditor } from './shared/access'
import { fromDict, label } from './shared/labels'
import { revalidateSite } from '../lib/revalidate'

export const REGIONS = ['yerevan', 'kotayk'] as const

/** Districts and towns. `key` is the value used in listing URLs (?district=kentron), kept from the demo. */
export const Districts: CollectionConfig = {
  slug: 'districts',
  labels: {
    singular: label('District', 'Վարչական շրջան', 'Район'),
    plural: label('Districts', 'Վարչական շրջաններ', 'Районы'),
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'region', 'key', 'order'],
    group: label('Listings', 'Գույք', 'Объекты'),
  },
  defaultSort: 'order',
  access: { read: anyone, create: isEditor, update: isEditor, delete: isAdmin },
  hooks: { afterChange: [() => revalidateSite()] },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: fromDict((d) => d.listings.groups.district),
    },
    {
      type: 'row',
      fields: [
        {
          name: 'region',
          type: 'select',
          required: true,
          defaultValue: 'yerevan',
          label: label('Region', 'Մարզ', 'Регион'),
          options: [
            { value: 'yerevan', label: label('Yerevan', 'Երևան', 'Ереван') },
            { value: 'kotayk', label: label('Kotayk', 'Կոտայք', 'Котайк') },
          ],
        },
        {
          name: 'key',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          label: label('URL key', 'URL բանալի', 'Ключ в URL'),
          admin: {
            description: label(
              'Latin letters, e.g. kentron. Used in links; avoid changing it.',
              'Լատինատառ, օր.՝ kentron։ Օգտագործվում է հղումներում, խուսափեք փոխելուց։',
              'Латиницей, напр. kentron. Используется в ссылках, лучше не менять.',
            ),
          },
          validate: (v: string | null | undefined) =>
            !v || /^[a-zA-Z][a-zA-Z0-9-]*$/.test(v) || 'Latin letters, digits and hyphens only',
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0,
          label: label('Order', 'Հերթականություն', 'Порядок'),
        },
      ],
    },
  ],
}
