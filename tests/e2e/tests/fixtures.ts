/**
 * Every spec runs under the shared guards from @wshno/playwright-config: a CSP violation, a console
 * error or warning, or a failed request (4xx/5xx, network error) fails the test. Opt out per spec
 * with `test.use({ cspGuard: { mode: 'warn' } })` and the like, or narrow with `allow`. coverageTest records
 * the page's V8 coverage for monocart-reporter when the CI config has it (playwright.config.ts).
 */
import { mergeTests } from '@playwright/test'
import { coverageTest, guardsTest } from '@wshno/playwright-config'

export { expect } from '@playwright/test'
export const test = mergeTests(guardsTest, coverageTest)
