import type { Access, FieldAccess, PayloadRequest } from 'payload'

/**
 * Roles:
 * - admin: everything, including users and site settings
 * - editor: all content (listings, districts, agents, leads)
 * - agent: creates listings and edits only their own; sees leads for their own listings
 */
type Role = 'admin' | 'editor' | 'agent'

const role = (req: PayloadRequest): Role | undefined =>
  (req.user as { role?: Role } | null)?.role

export const isAdmin: Access = ({ req }) => role(req) === 'admin'
export const isEditor: Access = ({ req }) => role(req) === 'admin' || role(req) === 'editor'
export const isStaff: Access = ({ req }) => Boolean(req.user)
export const anyone: Access = () => true

export const isAdminField: FieldAccess = ({ req }) => role(req) === 'admin'

export const isAgent = (req: PayloadRequest) => role(req) === 'agent'
export const isEditorReq = (req: PayloadRequest) => role(req) === 'admin' || role(req) === 'editor'
