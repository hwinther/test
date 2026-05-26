import { expect, test } from '@playwright/test'

test('home page renders', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Home' })).toBeVisible()
})

test('healthz returns ok', async ({ request }) => {
  const response = await request.get('/healthz')
  expect(response.status()).toBe(200)
  await expect(response.json()).resolves.toEqual({ status: 'ok' })
})
