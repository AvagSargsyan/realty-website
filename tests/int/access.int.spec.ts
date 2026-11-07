import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import type { Agent, District, Property, User } from '@/payload-types'

/**
 * Roles and listing rules, checked through the Local API with access control on
 * (overrideAccess: false + user), the same checks the admin and REST API go through.
 * Creates its own records with a unique suffix and removes them afterwards.
 */
let payload: Payload
const run = `t${Date.now()}`
const created: { collection: 'users' | 'agents' | 'districts' | 'properties'; id: number }[] = []

let editor: User
let agentA: User
let agentB: User
let profileA: Agent
let district: District

const as = (user: User) => ({ user, overrideAccess: false as const })

async function track<T extends { id: number }>(collection: (typeof created)[number]['collection'], doc: Promise<T>) {
  const d = await doc
  created.push({ collection, id: d.id })
  return d
}

const listing = (extra: Partial<Property> = {}) =>
  ({
    title: `Test listing ${run}`,
    deal: 'sale',
    type: 'apartment',
    district: district.id,
    priceUsd: 100000,
    area: 80,
    ...extra,
  }) as Omit<Property, 'id' | 'createdAt' | 'updatedAt'>

describe('Access and listing rules', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const user = (email: string, role: User['role']) =>
      track('users', payload.create({ collection: 'users', data: { email: `${email}-${run}@test.local`, password: 'test-pass-123', role } }))
    editor = await user('editor', 'editor')
    agentA = await user('agent-a', 'agent')
    agentB = await user('agent-b', 'agent')
    district = await track('districts', payload.create({ collection: 'districts', data: { name: 'Test', key: `test-${run}`, region: 'yerevan' } }))
    profileA = await track('agents', payload.create({ collection: 'agents', data: { name: 'Agent A', phone: '+374 00 000000', user: agentA.id } }))
  })

  afterAll(async () => {
    for (const { collection, id } of created.reverse()) {
      await payload.delete({ collection, id }).catch(() => {})
    }
  })

  it('gives new listings a code and a slug, and assigns agents their own listings', async () => {
    const p = await track('properties', payload.create({ collection: 'properties', data: listing({ title: `Բնակարան Արաբկիր ${run}` }), ...as(agentA) }))
    expect(p.code).toBeGreaterThanOrEqual(422000)
    expect(p.slug).toBe(`bnakaran-arabkir-${run}`)
    expect(typeof p.agent === 'object' ? p.agent?.id : p.agent).toBe(profileA.id)
  })

  it('lets an agent edit their own listing but not another agent’s', async () => {
    const own = await track('properties', payload.create({ collection: 'properties', data: listing(), ...as(agentA) }))
    const others = await track('properties', payload.create({ collection: 'properties', data: listing(), ...as(agentB) }))

    await expect(payload.update({ collection: 'properties', id: own.id, data: { priceUsd: 95000 }, ...as(agentA) })).resolves.toMatchObject({ priceUsd: 95000 })
    await expect(payload.update({ collection: 'properties', id: others.id, data: { priceUsd: 1 }, ...as(agentA) })).rejects.toThrow()
    await expect(payload.delete({ collection: 'properties', id: own.id, ...as(agentA) })).rejects.toThrow()
  })

  it('shows visitors only published listings', async () => {
    const draft = await track('properties', payload.create({ collection: 'properties', data: listing(), ...as(editor) }))
    const visible = await payload.find({ collection: 'properties', where: { id: { equals: draft.id } }, overrideAccess: false })
    expect(visible.totalDocs).toBe(0)
  })

  it('requires a photo before publishing', async () => {
    await expect(payload.create({ collection: 'properties', data: listing({ status: 'published' }), ...as(editor) })).rejects.toThrow()
  })

  it('lets only admins change roles and site settings', async () => {
    const updated = await payload.update({ collection: 'users', id: agentA.id, data: { role: 'admin' }, ...as(agentA) })
    expect(updated.role).toBe('agent')
    await expect(payload.updateGlobal({ slug: 'site-settings', data: { phone: '+1' }, ...as(editor) })).rejects.toThrow()
  })

  it('hides other staff accounts from non-admins', async () => {
    const users = await payload.find({ collection: 'users', ...as(agentA) })
    expect(users.docs.map((u) => u.id)).toEqual([agentA.id])
  })
})
