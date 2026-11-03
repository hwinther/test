import { randomBytes } from 'node:crypto'

/** The path browsers POST CSP violation reports to (routes/csp-report.tsx). */
export const CSP_REPORT_PATH = '/csp-report'

/** The OIDC provider. The browser talks to it directly (discovery, token, silent renew). */
const OIDC_AUTHORITY = 'https://auth.wsh.no'

/**
 * Creates a fresh nonce for one HTML document.
 * @returns {string} 16 random bytes, base64.
 */
export function createNonce(): string {
  return randomBytes(16).toString('base64')
}

/**
 * The Content-Security-Policy for HTML documents.
 *
 * - Scripts: same origin, plus inline scripts carrying this request's nonce (React Router's hydration
 *   data and module loader, React's streaming scripts, and the runtime-config script in root.tsx).
 *   No 'unsafe-inline' and no 'unsafe-eval'.
 * - Styles: same origin. style-src-attr allows inline style attributes, which SSR renders from
 *   React's `style` props. Inline <style> elements stay blocked.
 * - connect-src: the API, OTLP traces and the leaderboard are same origin; the OIDC client in
 *   auth.context.tsx fetches discovery and tokens from the authority. frame-src lets its silent
 *   renew fall back to an iframe.
 * - Reports go to CSP_REPORT_PATH, via report-to (Chromium) and report-uri (Firefox).
 * @param {string} nonce - This request's nonce, from {@link createNonce}.
 * @returns {string} The policy header value.
 */
export function contentSecurityPolicy(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self'",
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data:",
    `connect-src 'self' ${OIDC_AUTHORITY}`,
    `frame-src ${OIDC_AUTHORITY}`,
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    `report-uri ${CSP_REPORT_PATH}`,
    'report-to csp',
  ].join('; ')
}

/**
 * `report-only` (default) sends the policy as Content-Security-Policy-Report-Only: violations are
 * reported, nothing is blocked. `enforce` sends it as Content-Security-Policy. Set by CSP_MODE.
 * @returns {'enforce' | 'report-only'} The mode.
 */
export function cspMode(): 'enforce' | 'report-only' {
  return process.env.CSP_MODE?.trim() === 'enforce' ? 'enforce' : 'report-only'
}

/**
 * Headers for every response the SSR server renders: documents and data requests.
 * @param {Headers} headers - The response headers to add to.
 */
export function applySecurityHeaders(headers: Headers): void {
  // Not includeSubDomains: that would force HTTPS on every *.wsh.no name.
  headers.set('Strict-Transport-Security', 'max-age=31536000')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()')
  headers.set('Cross-Origin-Opener-Policy', 'same-origin')
}

/**
 * Adds the CSP to an HTML document response. Only in production builds: the Vite dev server injects
 * inline scripts without a nonce.
 * @param {Headers} headers - The document response headers.
 * @param {string} nonce - This request's nonce.
 */
export function applyDocumentCsp(headers: Headers, nonce: string): void {
  if (process.env.NODE_ENV !== 'production') return
  const name = cspMode() === 'enforce' ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only'
  headers.set(name, contentSecurityPolicy(nonce))
  headers.set('Reporting-Endpoints', `csp="${CSP_REPORT_PATH}"`)
}
