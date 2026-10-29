import { startWebTelemetry } from '@wshno/otel/web'

import { readPublicRuntimeConfigFromWindow } from '~/public-runtime-config'

/**
 * Initializes browser tracing using the runtime-injected or build-time OTEL endpoint.
 * No-ops when no traces endpoint is configured.
 */
export function startBrowserOpenTelemetry(): void {
  const fromDocument = readPublicRuntimeConfigFromWindow()
  startWebTelemetry({
    url: fromDocument?.otelTracesEndpoint?.trim() || import.meta.env.VITE_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    serviceName: fromDocument?.otelServiceName?.trim() || import.meta.env.VITE_OTEL_SERVICE_NAME || 'test-frontend-web',
  })
}
