import 'server-only'

/**
 * Emails a new lead to the office through Resend (https://resend.com, free plan).
 * Off when RESEND_API_KEY or LEAD_EMAIL_TO is empty (local development, CI).
 * Without an own domain, Resend only sends from onboarding@resend.dev, and only to the address the
 * Resend account was created with, which is enough for this project.
 */

const KIND_LABEL = { request: 'Viewing request', contact: 'Contact form', submit: 'Property submitted' } as const

export type LeadEmail = {
  id: number
  kind: keyof typeof KIND_LABEL
  name: string
  phone: string
  email?: string
  message?: string
  propertyCode?: number
  details?: Record<string, unknown>
  locale?: string
  pageUrl?: string
}

export async function sendLeadEmail(lead: LeadEmail, siteOrigin: string) {
  const key = process.env.RESEND_API_KEY
  const to = process.env.LEAD_EMAIL_TO
  if (!key || !to) return

  const lines = [`${KIND_LABEL[lead.kind]} from the website`, '', `Name: ${lead.name}`, `Phone: ${lead.phone}`]
  if (lead.email) lines.push(`Email: ${lead.email}`)
  if (lead.propertyCode) lines.push(`Listing: ID ${lead.propertyCode}`)
  if (lead.locale) lines.push(`Language: ${lead.locale}`)
  if (lead.pageUrl) lines.push(`Page: ${lead.pageUrl}`)
  if (lead.details) {
    lines.push('', 'Property details:')
    for (const [k, v] of Object.entries(lead.details)) if (v !== undefined && v !== '') lines.push(`  ${k}: ${String(v)}`)
  }
  if (lead.message) lines.push('', 'Message:', lead.message)
  lines.push('', `Open in the admin: ${siteOrigin}/admin/collections/leads/${lead.id}`)

  const subject = [KIND_LABEL[lead.kind], lead.name, lead.propertyCode && `ID ${lead.propertyCode}`].filter(Boolean).join(' · ')

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.LEAD_EMAIL_FROM || 'Avenue website <onboarding@resend.dev>',
        to: [to],
        subject,
        text: lines.join('\n'),
        ...(lead.email ? { reply_to: lead.email } : {}),
      }),
    })
    if (!res.ok) console.error('Lead email failed', res.status, await res.text())
  } catch (err) {
    console.error('Lead email failed', err)
  }
}
