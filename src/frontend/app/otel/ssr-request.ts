import { withRequestSpan } from '@wshno/otel/ssr'

/**
 * Wraps an async function in an `ssr.document` span, continuing the trace from the request's headers.
 * @template T
 * @param {Request} request - The incoming HTTP request whose headers carry the parent trace context.
 * @param {() => Promise<T>} fn - The async work to execute inside the span.
 * @returns {Promise<T>} The result of `fn`.
 */
export function withSsrRequestSpan<T>(request: Request, fn: () => Promise<T>): Promise<T> {
  return withRequestSpan(request, fn, { tracerName: 'test-frontend.react-router' })
}
