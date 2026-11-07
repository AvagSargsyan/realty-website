'use server'

import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { isLocale } from '@/i18n/config'
import { isEmail, isPhone } from '@/lib/validation'

export type LeadInput = {
  kind: 'request' | 'contact'
  name: string
  phone: string
  email?: string
  message: string
  /** Public code of the listing the request is about */
  propertyCode?: number
  locale: string
  /** Hidden field: people never see or fill it, simple bots do */
  website?: string
}

export type LeadResult = { ok: true } | { ok: false; error: 'invalid' | 'failed' }

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/**
 * Saves a contact or viewing request as a Lead (Admin → Clients → Leads). Runs on the server, so it
 * re-checks everything the browser checked and writes with the Local API; the public REST API
 * can't create leads.
 */
export async function submitLead(input: LeadInput): Promise<LeadResult> {
  // Bots that fill the hidden field get a normal-looking success and nothing is stored
  if (clip(input.website, 200)) return { ok: true }

  const name = clip(input.name, 120)
  const phone = clip(input.phone, 40)
  const email = clip(input.email, 200)
  const message = clip(input.message, 4000)
  const kind = input.kind === 'request' ? 'request' : 'contact'
  if (!name || !isPhone(phone) || !message || (email && !isEmail(email))) return { ok: false, error: 'invalid' }

  try {
    const payload = await getPayload({ config })

    let property: number | undefined
    if (input.propertyCode) {
      const found = await payload.find({
        collection: 'properties',
        where: { code: { equals: Number(input.propertyCode) } },
        limit: 1,
        depth: 0,
        select: {},
      })
      property = found.docs[0]?.id
    }

    await payload.create({
      collection: 'leads',
      data: {
        kind,
        status: 'new',
        name,
        phone,
        email: email || undefined,
        message,
        property,
        locale: isLocale(input.locale) ? input.locale : undefined,
        pageUrl: clip((await headers()).get('referer'), 500) || undefined,
      },
      // Visitors aren't logged in; this server code is the only way to create a lead
      overrideAccess: true,
    })
    return { ok: true }
  } catch (err) {
    console.error('submitLead failed', err)
    return { ok: false, error: 'failed' }
  }
}
