import type { Config } from '@react-router/dev/config'

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  // React Router refuses a document or fetcher action (400 "Bad Request") whose Origin header doesn't
  // match request.url's origin. Behind the ingress, TLS ends before the pod and react-router-serve
  // doesn't trust X-Forwarded-Proto, so request.url is http:// while browsers send Origin: https://.
  // Resource routes (resources/leaderboard, csp-report) aren't checked, so nothing breaks today; this
  // keeps a future <Form> or useFetcher from failing only once deployed (as it did in ClutterStock).
  // Hosts only: cross-site origins are still refused. Local dev is plain http on both sides.
  allowedActionOrigins: ['test.test.wsh.no', '*.preview.wsh.no'],
  // The whole route manifest in the first document instead of lazy discovery through
  // /__manifest?paths=/,/about,/blogs. The OPNsense NAXSI edge scores the commas in that query and
  // blocks it from the third path on (a 200 "Request Denied" page, so hydration logs "Failed to fetch
  // manifest patches"). Found by the nightly preview e2e run; the manifest is small for this app.
  routeDiscovery: { mode: 'initial' },
} satisfies Config
