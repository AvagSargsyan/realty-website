import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminField } from './shared/access'
import { label } from './shared/labels'

export const ROLES = ['admin', 'editor', 'agent'] as const
export type Role = (typeof ROLES)[number]

/** Admin-panel users (staff). Website visitors' accounts come later as a separate collection. */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: label('User', 'Օգտատեր', 'Пользователь'),
    plural: label('Users', 'Օգտատերեր', 'Пользователи'),
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
    group: label('Settings', 'Կարգավորումներ', 'Настройки'),
  },
  auth: true,
  access: {
    // Admins manage everyone; other staff see and edit only their own account
    read: ({ req }) => (req.user?.role === 'admin' ? true : { id: { equals: req.user?.id } }),
    create: isAdmin,
    update: ({ req }) => (req.user?.role === 'admin' ? true : { id: { equals: req.user?.id } }),
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: label('Name', 'Անուն', 'Имя'),
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      // The first user created in a fresh database becomes an admin
      defaultValue: 'admin',
      label: label('Role', 'Դեր', 'Роль'),
      options: [
        { value: 'admin', label: label('Admin', 'Ադմին', 'Админ') },
        { value: 'editor', label: label('Editor', 'Խմբագիր', 'Редактор') },
        { value: 'agent', label: label('Agent', 'Գործակալ', 'Агент') },
      ],
      saveToJWT: true,
      access: {
        // Only admins can change roles
        update: isAdminField,
      },
      admin: {
        description: label(
          'Admin: everything. Editor: all listings and leads. Agent: only their own listings.',
          'Ադմին՝ ամեն ինչ։ Խմբագիր՝ ամբողջ գույքը և հայտերը։ Գործակալ՝ միայն իր գույքը։',
          'Админ: всё. Редактор: все объекты и заявки. Агент: только свои объекты.',
        ),
      },
    },
  ],
}
