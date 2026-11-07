import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('/ redirects to a language and shows the site header', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveURL(/\/(hy|en|ru)$/)
    await expect(page).toHaveTitle(/Avenue Real Estate Agency/)
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
  })

  test('switching language keeps the page and changes <html lang>', async ({ page }) => {
    await page.goto('http://localhost:3000/en')
    await page.getByRole('button', { name: /Language/ }).click()
    await page.getByRole('menuitem', { name: 'Русский' }).click()

    await expect(page).toHaveURL(/\/ru$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru')
  })

  test('unknown pages show the site 404', async ({ page }) => {
    const res = await page.goto('http://localhost:3000/hy/does-not-exist')
    expect(res?.status()).toBe(404)
    await expect(page.locator('text=404').first()).toBeVisible()
  })
})
