import { expectAccessible } from '@wshno/playwright-config'

import { expect, test } from './fixtures'

test('home page renders', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Home' })).toBeVisible()
})

// axe (WCAG 2.x A/AA): fails on serious or critical violations.
test('home page is accessible', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Home' })).toBeVisible()
  await expectAccessible(page)
})

test('healthz returns ok', async ({ request }) => {
  const response = await request.get('/healthz')
  expect(response.status()).toBe(200)
  await expect(response.json()).resolves.toEqual({ status: 'ok' })
})
