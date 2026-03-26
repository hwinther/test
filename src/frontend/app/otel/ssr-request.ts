import { context, propagation, SpanStatusCode, trace } from '@opentelemetry/api'

import { headersTextMapGetter } from './propagation'

/**
 * Wraps an async function in an `ssr.document` span, extracting W3C trace context from the request headers.
 * @template T
 * @param {Request} request - The incoming HTTP request whose headers carry the parent trace context.
 * @param {() => Promise<T>} fn - The async work to execute inside the span.
 * @returns {Promise<T>} The result of `fn`.
 */
export function withSsrRequestSpan<T>(request: Request, fn: () => Promise<T>): Promise<T> {
  const parentCtx = propagation.extract(context.active(), request.headers, headersTextMapGetter)

  return context.with(parentCtx, async () => {
    const tracer = trace.getTracer('test-frontend.react-router')
    const span = tracer.startSpan('ssr.document', {
      attributes: {
        'http.request.method': request.method,
        'url.full': request.url,
      },
    })
    const spanCtx = trace.setSpan(context.active(), span)

    try {
      const result = await context.with(spanCtx, fn)
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (err) {
      span.recordException(err as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err instanceof Error ? err.message : String(err),
      })
      throw err
    } finally {
      span.end()
    }
  })
}
