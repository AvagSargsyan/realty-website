import type { CollectionConfig } from 'payload'

export const ROLES = ['admin', 'editor', 'agent'] as const
export type Role = (typeof ROLES)[number]

/** Admin-panel users (staff). Website visitors' accounts come later as a separate collection. */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      // The first user created in a fresh database becomes an admin
      defaultValue: 'admin',
      options: ROLES.map((r) => ({ label: r[0].toUpperCase() + r.slice(1), value: r })),
      saveToJWT: true,
      access: {
        // Only admins can change roles
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
  ],
}
