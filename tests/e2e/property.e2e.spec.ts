import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config.js'

/**
 * Listing pages and the viewing-request form, against the dev server with seeded data (pnpm seed).
 * The test lead is removed afterwards.
 */
const PREFIX = 'E2E Visitor'
const NAME = `${PREFIX} ${Date.now()}`

// By prefix, not by NAME: after a failure Playwright restarts the worker, which gets a new NAME
test.afterAll(async () => {
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'leads', where: { name: { like: PREFIX } } })
})

test('a listing without its slug redirects to the full address', async ({ page }) => {
  await page.goto('http://localhost:3000/en/listings')
  const href = await page.locator('main article h3 a').first().getAttribute('href')
  const code = href?.match(/\/property\/(\d+)/)?.[1]
  expect(code).toBeTruthy()

  await page.goto(`http://localhost:3000/en/property/${code}`)
  await expect(page).toHaveURL(new RegExp(`/en/property/${code}/[a-z0-9-]+$`))
  await expect(page.locator('h1')).toBeVisible()
})

test('an unknown listing shows "Property not found"', async ({ page }) => {
  const res = await page.goto('http://localhost:3000/en/property/1')
  expect(res?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'Property not found' })).toBeVisible()
})

test('a viewing request is saved as a lead linked to the listing', async ({ page }) => {
  await page.goto('http://localhost:3000/en/listings')
  await page.locator('main article h3 a').first().click()
  await page.waitForURL(/\/en\/property\/\d+\//)
  const code = Number(page.url().match(/\/property\/(\d+)/)?.[1])

  await page.getByRole('button', { name: 'Send a request' }).first().click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Your name').fill(NAME)
  await dialog.getByLabel('Phone').fill('+374 10 000000')
  await dialog.getByRole('button', { name: 'Send' }).click()
  await expect(dialog.getByRole('status')).toContainText('Thank you')

  const payload = await getPayload({ config })
  const leads = await payload.find({ collection: 'leads', where: { name: { equals: NAME } }, depth: 1 })
  expect(leads.totalDocs).toBe(1)
  const lead = leads.docs[0]
  expect(lead.kind).toBe('request')
  expect(lead.locale).toBe('en')
  expect(typeof lead.property === 'object' && lead.property?.code).toBe(code)
})
