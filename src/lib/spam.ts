import 'server-only'

import { createHash } from 'crypto'
import type { Payload } from 'payload'

/**
 * Spam protection for the site's forms (used by src/app/actions/leads.ts):
 * - Cloudflare Turnstile: a bot check, invisible for most visitors. Off when TURNSTILE_SECRET_KEY is
 *   empty (local development, CI).
 * - A submission limit per visitor: LIMIT leads per WINDOW_MINUTES from the same IP address. The address
 *   is stored only as a salted hash on the lead (ipHash), never in plain text.
 */

export const LIMIT = 5
export const WINDOW_MINUTES = 10

/** The visitor's IP address as Vercel reports it (x-real-ip), or the first x-forwarded-for entry. */
export function clientIp(h: Headers): string | undefined {
  return h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? undefined
}

/** Salted with PAYLOAD_SECRET, so the stored value can't be turned back into an address. */
export function hashIp(ip: string | undefined): string | undefined {
  if (!ip) return undefined
  return createHash('sha256').update(`${process.env.PAYLOAD_SECRET ?? ''}:${ip}`).digest('hex').slice(0, 32)
}

/** This machine (local development and e2e tests). Visitors on Vercel never have these addresses. */
const LOOPBACK = new Set(['::1', '127.0.0.1', '::ffff:127.0.0.1'])

/** True when this visitor already sent LIMIT leads in the last WINDOW_MINUTES. */
export async function isRateLimited(payload: Payload, ip: string | undefined, ipHash: string | undefined): Promise<boolean> {
  if (!ipHash || (ip && LOOPBACK.has(ip))) return false
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString()
  const { totalDocs } = await payload.count({
    collection: 'leads',
    where: { and: [{ ipHash: { equals: ipHash } }, { createdAt: { greater_than: since } }] },
  })
  return totalDocs >= LIMIT
}

/** Checks a Turnstile token with Cloudflare. Always passes when no secret key is configured. */
export async function verifyBotCheck(token: string | undefined, ip: string | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
    })
    const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] }
    if (!data.success) console.warn('Turnstile check failed', data['error-codes'])
    return data.success === true
  } catch (err) {
    console.error('Turnstile check could not run', err)
    return false
  }
}
