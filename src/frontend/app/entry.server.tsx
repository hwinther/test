import { PassThrough } from 'node:stream'

import type { EntryContext, RouterContextProvider } from 'react-router'
import { createReadableStreamFromReadable } from '@react-router/node'
import { ServerRouter } from 'react-router'
import { isbot } from 'isbot'
import type { RenderToPipeableStreamOptions } from 'react-dom/server' // cspell:ignore Pipeable
import { renderToPipeableStream } from 'react-dom/server'

import { NonceContext } from '~/lib/nonce'
import { applyDocumentCsp, applySecurityHeaders, createNonce } from '~/lib/security-headers.server'
import { startNodeOpenTelemetry } from '~/otel/server'
import { withSsrRequestSpan } from '~/otel/ssr-request'

startNodeOpenTelemetry()

export const streamTimeout = 5_000

/**
 * Handles incoming SSR requests, wrapping the render in an OTEL span for distributed tracing.
 * @param {Request} request - The incoming HTTP request.
 * @param {number} responseStatusCode - The initial HTTP status code for the response.
 * @param {Headers} responseHeaders - The HTTP headers for the response.
 * @param {EntryContext} routerContext - The React Router entry context.
 * @param {RouterContextProvider} loadContext - The app-level load context (React Router 8 enables middleware by default).
 * @returns {Response | Promise<Response>} The streamed HTML response.
 */
export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: RouterContextProvider,
) {
  applySecurityHeaders(responseHeaders)

  if (request.method.toUpperCase() === 'HEAD') {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders,
    })
  }

  return withSsrRequestSpan(request, () =>
    renderHtmlResponse(request, responseStatusCode, responseHeaders, routerContext, loadContext),
  )
}

/**
 * Renders the React Router application to a streamed HTML response.
 * @param {Request} request - The incoming HTTP request.
 * @param {number} responseStatusCode - The initial HTTP status code.
 * @param {Headers} responseHeaders - The HTTP headers for the response.
 * @param {EntryContext} routerContext - The React Router entry context.
 * @param {RouterContextProvider} _loadContext - The app-level load context (unused).
 * @returns {Promise<Response>} The streamed HTML response.
 */
async function renderHtmlResponse(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: RouterContextProvider,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    let shellRendered = false
    const userAgent = request.headers.get('user-agent')
    // One nonce per document: on the CSP header, React Router's scripts (via <ServerRouter nonce>),
    // React's streaming scripts (renderToPipeableStream), and the app's own (NonceContext).
    const nonce = createNonce()
    applyDocumentCsp(responseHeaders, nonce)

    const readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode ? 'onAllReady' : 'onShellReady'

    let timeoutId: ReturnType<typeof setTimeout> | undefined = setTimeout(() => abort(), streamTimeout + 1000)

    const { pipe, abort } = renderToPipeableStream(
      <NonceContext value={nonce}>
        <ServerRouter context={routerContext} url={request.url} nonce={nonce} />
      </NonceContext>,
      {
        nonce,
        [readyOption]() {
          shellRendered = true
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId)
              timeoutId = undefined
              callback()
            },
          })
          const stream = createReadableStreamFromReadable(body)

          responseHeaders.set('Content-Type', 'text/html')

          pipe(body)

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          )
        },
        onShellError(error: unknown) {
          reject(error)
        },
        onError(error: unknown) {
          responseStatusCode = 500
          if (shellRendered) {
            console.error(error)
          }
        },
      },
    )
  })
}

/**
 * Data requests (client navigations, fetchers) get the same headers; the CSP is for documents.
 * @param {Response} response - The data response React Router is about to send.
 * @returns {Response} The same response, with the security headers.
 */
export function handleDataRequest(response: Response): Response {
  applySecurityHeaders(response.headers)
  return response
}
