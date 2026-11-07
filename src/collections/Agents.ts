import type { CollectionConfig } from 'payload'

import { anyone, isAdmin, isEditor } from './shared/access'
import { fromDict, label } from './shared/labels'
import { revalidateSite } from '../lib/revalidate'

/** Public agent profiles shown on listings. `user` links a profile to an admin login with the agent role. */
export const Agents: CollectionConfig = {
  slug: 'agents',
  labels: {
    singular: label('Agent', 'Գործակալ', 'Агент'),
    plural: label('Agents', 'Գործակալներ', 'Агенты'),
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'languages', 'user'],
    group: label('Listings', 'Գույք', 'Объекты'),
  },
  access: { read: anyone, create: isEditor, update: isEditor, delete: isAdmin },
  hooks: { afterChange: [() => revalidateSite()] },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: label('Name', 'Անուն', 'Имя'),
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: label('Photo', 'Լուսանկար', 'Фото'),
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', required: true, label: fromDict((d) => d.form.phone) },
        {
          name: 'whatsapp',
          type: 'text',
          label: fromDict((d) => d.contact.whatsapp),
          admin: { description: label('Digits only, with country code', 'Միայն թվեր՝ երկրի կոդով', 'Только цифры, с кодом страны') },
          validate: (v: string | null | undefined) =>
            !v || /^\d{8,15}$/.test(v) || 'Digits only, e.g. 37493772271',
        },
      ],
    },
    { name: 'email', type: 'email', label: fromDict((d) => d.form.email) },
    {
      name: 'languages',
      type: 'select',
      hasMany: true,
      label: label('Languages', 'Լեզուներ', 'Языки'),
      options: [
        { value: 'hy', label: 'Հայերեն' },
        { value: 'en', label: 'English' },
        { value: 'ru', label: 'Русский' },
      ],
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      unique: true,
      label: label('Admin login', 'Ադմին հաշիվ', 'Учётная запись'),
      admin: {
        position: 'sidebar',
        description: label(
          'A user with the agent role who can edit this agent’s listings.',
          'Գործակալ դերով օգտատեր, ով կարող է խմբագրել այս գործակալի գույքը։',
          'Пользователь с ролью агента, который может редактировать объекты этого агента.',
        ),
      },
    },
  ],
}
