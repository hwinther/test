import type { Page } from '@playwright/test'

import { expect, test } from './fixtures'

/**
 * Åpner spillet med tastaturet fra forsiden.
 * @param {Page} page - Nettlesersiden.
 */
async function openGame(page: Page) {
  await page.goto('/')
  const launch = page.getByRole('button', { exact: true, name: 'Spill Botvar' })
  await launch.focus()
  await launch.press('Enter')
  await expect(page.getByLabel('Spillflate for Botvar')).toBeFocused()
}

// WebKit kan bryte CSP ved opptak av skjermbilder.
test.use({ screenshot: 'only-on-failure' })

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/Service/version', (route) => route.fulfill({ json: { informationalVersion: 'test' } }))
})

test('Botvar kan startes, pauses, gjenopptas og avsluttes med tastaturet', async ({ page }) => {
  await openGame(page)
  const documentStatus = page.getByRole('status', { name: 'Dokumentstatus' })
  await expect(documentStatus).toContainText('Ada lager et utkast om skolebibliotek.')
  const status = page.getByRole('status', { name: 'Spillstatus' })
  await page.keyboard.press('p')
  await expect(status).toHaveText('Pause')
  await page.keyboard.press('p')
  await expect(status).toHaveText('Spiller')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { exact: true, name: 'Spill Botvar' })).toBeVisible()
})

test('lokale poeng beholdes ved ny innlasting uten nettverkskall @local-only', async ({ page }) => {
  // En bane uten gulv lar spilleren falle til alle livene er brukt opp.
  const course = {
    dimensions: { height: 13, tileSize: 32, width: 25 },
    id: 'empty-floor',
    metadata: { author: 'Test', description: '', difficulty: 1, theme: 'overworld' },
    name: 'Bane uten gulv',
    objects: { collectibles: [], enemies: [], spawners: [] },
    startPosition: { x: 1, y: 10 },
    tiles: [],
    version: '1.0.0',
  }
  const requests: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/resources/leaderboard') requests.push(request.method())
  })

  for (const name of ['ÅSE', 'BJØRN']) {
    await openGame(page)
    await page.keyboard.press('e')
    await page.locator('input[type=file]').setInputFiles({
      buffer: Buffer.from(JSON.stringify(course)),
      mimeType: 'application/json',
      name: 'course.json',
    })
    await expect(page.getByPlaceholder('Banenavn')).toHaveValue(course.name)
    await page.getByRole('button', { name: 'Prøvespill' }).click()
    await expect(page.getByRole('status', { name: 'Dokumentstatus' })).toHaveCount(0)
    const nameBox = page.getByRole('textbox')
    await expect(nameBox).toBeFocused()
    await nameBox.fill(name)
    await nameBox.press('Enter')
    await expect(page.getByText('ÅSE', { exact: true })).toBeVisible()
    await expect(page.getByText(name, { exact: true })).toBeVisible()
  }

  await page.keyboard.press('r')
  await expect(page.getByLabel('Spillflate for Botvar')).toBeFocused()
  expect(requests).toEqual([])
})
