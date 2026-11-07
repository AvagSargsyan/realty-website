import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config.js'

/** Contact, submit, saved listings and the text pages, against the dev server with seeded data. */
const PREFIX = 'E2E Pages'
const BASE = 'http://localhost:3000/en'

// By prefix: after a failure Playwright restarts the worker with fresh module state
test.afterAll(async () => {
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'leads', where: { name: { like: PREFIX } } })
})

async function findLead(name: string) {
  const payload = await getPayload({ config })
  const res = await payload.find({ collection: 'leads', where: { name: { equals: name } } })
  return res.docs[0]
}

test('the text pages load', async ({ page }) => {
  for (const [path, heading] of [
    ['/faq', 'Frequently asked questions'],
    ['/about', 'About Avenue'],
    ['/privacy', 'Privacy policy'],
    ['/terms', 'Terms of use'],
  ]) {
    const res = await page.goto(`${BASE}${path}`)
    expect(res?.status(), path).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
  }
})

test('the contact form saves a contact lead', async ({ page }) => {
  const name = `${PREFIX} contact ${Date.now()}`
  await page.goto(`${BASE}/contact`)
  await page.getByLabel('Your name').fill(name)
  await page.getByLabel('Phone').fill('+374 10 000000')
  await page.getByLabel('Message', { exact: true }).fill('Hello from the e2e test')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Thank you' })).toBeVisible()

  const lead = await findLead(name)
  expect(lead?.kind).toBe('contact')
  expect(lead?.message).toBe('Hello from the e2e test')
})

test('the submit form saves the property details', async ({ page }) => {
  const name = `${PREFIX} submit ${Date.now()}`
  await page.goto(`${BASE}/submit`)
  await page.getByLabel('District').selectOption('arabkir')
  await page.getByLabel('Street and building').fill('Komitas 1')
  await page.getByLabel('Area, m²').fill('85')
  await page.getByLabel('Your name').fill(name)
  await page.getByLabel('Phone').fill('+374 10 000000')
  await page.getByRole('button', { name: 'Submit property' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'we’ve got it' })).toBeVisible()

  const lead = await findLead(name)
  expect(lead?.kind).toBe('submit')
  expect(lead?.details).toMatchObject({ deal: 'sale', type: 'apartment', district: 'arabkir', address: 'Komitas 1', area: 85 })
})

test('a saved listing appears on the Saved page', async ({ page }) => {
  await page.goto(`${BASE}/listings`)
  const title = await page.locator('main article h3').first().innerText()
  await page.locator('main article').first().getByRole('button', { name: 'Save' }).click()

  await page.goto(`${BASE}/favorites`)
  await expect(page.locator('main article h3').first()).toHaveText(title)
  await expect(page.getByText('1 property')).toBeVisible()
})
