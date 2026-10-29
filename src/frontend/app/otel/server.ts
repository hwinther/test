import { startNodeTelemetry } from '@wshno/otel/node'

/**
 * Starts the Node SDK for the SSR server. It reads the standard OTEL_* env vars at runtime (set e.g.
 * OTEL_EXPORTER_OTLP_ENDPOINT in K8s/Docker); browser traces use the URLs injected by the root loader
 * (see root.tsx), which may differ from the in-cluster collector URL.
 */
export function startNodeOpenTelemetry(): void {
  startNodeTelemetry({ serviceName: 'test-frontend-ssr' })
}
