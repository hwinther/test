/**
 * Every spec runs under the shared guards from @wshno/playwright-config: a CSP violation, a console
 * error or warning, or a failed request (4xx/5xx, network error) fails the test. Opt out per spec
 * with `test.use({ cspGuard: { mode: 'warn' } })` and the like, or narrow with `allow`.
 */
export { expect } from '@playwright/test'
export { guardsTest as test } from '@wshno/playwright-config'
