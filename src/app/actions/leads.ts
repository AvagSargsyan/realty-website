'use server'

import config from '@payload-config'
import { headers } from 'next/headers'
import { after } from 'next/server'
import { getPayload } from 'payload'

import { isLocale } from '@/i18n/config'
import { sendLeadEmail } from '@/lib/lead-email'
import { clientIp, hashIp, isRateLimited, verifyBotCheck } from '@/lib/spam'
import { isEmail, isPhone } from '@/lib/validation'

/** What an owner tells us on "Submit a property" (shown in the lead as "Submitted property details"). */
export type SubmittedProperty = {
  deal: 'sale' | 'rent'
  type: string
  district: string
  address: string
  area: number
  rooms?: number
  priceUsd?: number
}

export type LeadInput = {
  kind: 'request' | 'contact' | 'submit'
  name: string
  phone: string
  email?: string
  message: string
  /** Public code of the listing the request is about */
  propertyCode?: number
  /** Only for kind "submit" */
  details?: SubmittedProperty
  locale: string
  /** Hidden field: people never see or fill it, simple bots do */
  website?: string
  /** Cloudflare Turnstile token from the form's bot check */
  botToken?: string
}

export type LeadResult = { ok: true } | { ok: false; error: 'invalid' | 'failed' | 'botCheck' | 'tooMany' }

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const positive = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : undefined)

/** Keep only known, sane values from the browser; null if a required one is missing. */
function cleanDetails(d: SubmittedProperty | undefined): SubmittedProperty | undefined {
  if (!d) return undefined
  const deal = d.deal === 'rent' ? 'rent' : 'sale'
  const type = ['apartment', 'house', 'commercial', 'land'].includes(d.type) ? d.type : ''
  const district = clip(d.district, 60)
  const address = clip(d.address, 200)
  const area = positive(d.area)
  if (!type || !district || !address || !area) return undefined
  return { deal, type, district, address, area, rooms: positive(d.rooms), priceUsd: positive(d.priceUsd) }
}

/**
 * Saves a contact or viewing request as a Lead (Admin → Clients → Leads) and emails it to the office.
 * Runs on the server, so it re-checks everything the browser checked and writes with the Local API;
 * the public REST API can't create leads. Spam checks: the honeypot, Turnstile and a per-visitor
 * limit (src/lib/spam.ts).
 */
export async function submitLead(input: LeadInput): Promise<LeadResult> {
  // Bots that fill the hidden field get a normal-looking success and nothing is stored
  if (clip(input.website, 200)) return { ok: true }

  const name = clip(input.name, 120)
  const phone = clip(input.phone, 40)
  const email = clip(input.email, 200)
  const message = clip(input.message, 4000)
  const kind = input.kind === 'request' || input.kind === 'submit' ? input.kind : 'contact'
  if (!name || !isPhone(phone) || (email && !isEmail(email))) return { ok: false, error: 'invalid' }

  // A message is required except on "Submit a property", where the property details are the point
  let details: SubmittedProperty | undefined
  if (kind === 'submit') {
    details = cleanDetails(input.details)
    if (!details) return { ok: false, error: 'invalid' }
  } else if (!message) return { ok: false, error: 'invalid' }

  const h = await headers()
  const ip = clientIp(h)
  if (!(await verifyBotCheck(input.botToken, ip))) return { ok: false, error: 'botCheck' }

  try {
    const payload = await getPayload({ config })
    const ipHash = hashIp(ip)
    if (await isRateLimited(payload, ip, ipHash)) return { ok: false, error: 'tooMany' }

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

    const locale = isLocale(input.locale) ? input.locale : undefined
    const pageUrl = clip(h.get('referer'), 500) || undefined
    const lead = await payload.create({
      collection: 'leads',
      data: {
        kind,
        status: 'new',
        name,
        phone,
        email: email || undefined,
        message: message || undefined,
        property,
        details,
        locale,
        pageUrl,
        ipHash,
      },
      // Visitors aren't logged in; this server code is the only way to create a lead
      overrideAccess: true,
    })

    // Email the office after the visitor already got the answer, so a slow mail API never delays the form
    const origin = `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('host')}`
    const propertyCode = property ? Number(input.propertyCode) : undefined
    after(() => sendLeadEmail({ id: lead.id, kind, name, phone, email: email || undefined, message: message || undefined, propertyCode, details, locale, pageUrl }, origin))

    return { ok: true }
  } catch (err) {
    console.error('submitLead failed', err)
    return { ok: false, error: 'failed' }
  }
}
