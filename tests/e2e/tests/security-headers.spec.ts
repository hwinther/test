import { parseCsp } from '@wshno/playwright-config'

import { expect, test } from './fixtures'

// src/frontend/app/lib/security-headers.server.ts. The e2e stack leaves CSP_MODE unset, so the policy
// comes as Content-Security-Policy-Report-Only; cspGuard fails a spec on Report-Only violations too.
const cspHeader = 'content-security-policy-report-only'

const expected = {
  'cross-origin-opener-policy': 'same-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'strict-transport-security': 'max-age=31536000',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
}

/**
 * The nonce source in a policy's script-src.
 * @param {string | undefined} header - The CSP header value.
 * @returns {string | undefined} The nonce, without the 'nonce-…' wrapper.
 */
function nonceOf(header: string | undefined): string | undefined {
  return parseCsp(header)[0]
    ?.get('script-src')
    ?.find((source) => source.startsWith("'nonce-"))
    ?.slice(7, -1)
}

test.describe('security headers', () => {
  test('documents carry the headers and a per-request nonce', async ({ request }) => {
    const first = (await request.get('/')).headers()
    const second = (await request.get('/')).headers()
    expect(first).toMatchObject(expected)
    expect(first['reporting-endpoints']).toBe('csp="/csp-report"')
    expect(nonceOf(first[cspHeader])).toBeTruthy()
    expect(nonceOf(first[cspHeader])).not.toBe(nonceOf(second[cspHeader]))
  })

  test('the policy keeps scripts to the site and the nonce', async ({ request }) => {
    const [policy] = parseCsp((await request.get('/')).headers()[cspHeader])
    expect(policy?.get('default-src')).toEqual(["'self'"])
    expect(policy?.get('script-src')?.filter((s) => !s.startsWith("'nonce-"))).toEqual(["'self'"])
    expect(policy?.get('object-src')).toEqual(["'none'"])
    expect(policy?.get('base-uri')).toEqual(["'none'"])
    expect(policy?.get('frame-ancestors')).toEqual(["'none'"])
    expect(policy?.get('report-uri')).toEqual(['/csp-report'])
  })

  test('every inline script in the page carries the header nonce', async ({ page }) => {
    const response = await page.goto('/')
    const nonce = nonceOf(response?.headers()[cspHeader])

    // Browsers hide the nonce attribute from the DOM; the nonce property still has it.
    const inline = await page
      .locator('script:not([src])')
      .evaluateAll((scripts) => scripts.map((script) => (script as HTMLScriptElement).nonce))
    expect(inline.length).toBeGreaterThan(0)
    expect(new Set(inline)).toEqual(new Set([nonce]))
  })

  test.describe('in the browser', () => {
    test.use({ cspGuard: { mode: 'warn' } })

    test('an injected inline script is reported', async ({ cspViolations, page }) => {
      await page.goto('/')
      await page.evaluate(() => {
        const script = document.createElement('script')
        script.textContent = 'window.__injected = true'
        document.body.append(script)
      })
      await expect
        .poll(() => cspViolations.map((v) => `${v.disposition} ${v.effectiveDirective}`))
        .toEqual(['report script-src-elem'])
    })
  })
})

test.describe('CSP report endpoint', () => {
  test('accepts report-uri and report-to bodies', async ({ request }) => {
    const reportUri = await request.post('/csp-report', {
      data: JSON.stringify({
        'csp-report': {
          'blocked-uri': 'inline',
          disposition: 'report',
          'document-uri': 'http://localhost/',
          'effective-directive': 'script-src-elem',
        },
      }),
      headers: { 'content-type': 'application/csp-report' },
    })
    expect(reportUri.status()).toBe(204)

    const reportTo = await request.post('/csp-report', {
      data: JSON.stringify([
        {
          body: {
            blockedURL: 'inline',
            disposition: 'report',
            documentURL: 'http://localhost/',
            effectiveDirective: 'script-src-elem',
          },
          type: 'csp-violation',
        },
      ]),
      headers: { 'content-type': 'application/reports+json' },
    })
    expect(reportTo.status()).toBe(204)
  })

  test('answers 204 to a malformed body and 405 to a GET', async ({ request }) => {
    const malformed = await request.post('/csp-report', {
      data: '{not json',
      headers: { 'content-type': 'application/csp-report' },
    })
    expect(malformed.status()).toBe(204)
    expect((await request.get('/csp-report')).status()).toBe(405)
  })
})
