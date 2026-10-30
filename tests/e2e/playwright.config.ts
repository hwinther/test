import { devices } from '@playwright/test'
import { definePlaywrightConfig } from '@wshno/playwright-config'
import { config } from 'dotenv'

// Load environment variables from .env file
config()

/**
 * Shared defaults (reporters, retries, forbidOnly, baseURL from BASE_URL, trace/video) come from
 * @wshno/playwright-config; only what differs is set here. See https://playwright.dev/docs/test-configuration.
 */
export default definePlaywrightConfig({
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  use: {
    actionTimeout: 10000,
    navigationTimeout: 30000,

    /* Screenshot every test, not only failures */
    screenshot: 'on',
  },

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
})
