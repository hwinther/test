import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router'

import type { Route } from './+types/root'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from '~/auth.context'
import { PageLayout } from '~/components/PageLayout'
import type { PublicRuntimeConfig } from '~/public-runtime-config'
import '~/components/PageLayout.css'

const queryClient = new QueryClient()

/**
 * Root loader that reads public runtime config (including OTEL endpoints)
 * from env vars on the server and exposes them to the browser via window injection.
 * @returns {Promise<{publicRuntime: PublicRuntimeConfig}>} Public runtime config for OTEL browser telemetry.
 */
export async function loader(): Promise<{ publicRuntime: PublicRuntimeConfig }> {
  // eslint-disable-next-line sonarjs/different-types-comparison -- SSR: globalThis.window is undefined on the server
  if (globalThis.window !== undefined) {
    const w = globalThis.window as Window & {
      __TEST_PUBLIC__?: PublicRuntimeConfig
    }
    return {
      publicRuntime: w.__TEST_PUBLIC__ ?? {
        otelTracesEndpoint: '',
        otelServiceName: '',
      },
    }
  }

  return {
    publicRuntime: {
      otelTracesEndpoint:
        process.env.PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT?.trim() ||
        process.env.VITE_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT?.trim() ||
        '',
      otelServiceName:
        process.env.PUBLIC_OTEL_SERVICE_NAME?.trim() ||
        process.env.VITE_OTEL_SERVICE_NAME?.trim() ||
        '',
    },
  }
}

/**
 * Injects public runtime config into the document so browser scripts can read it before hydration.
 * @returns {import('react').JSX.Element | null} A script element that sets window config, or null if no config is available.
 */
function PublicRuntimeConfigScript() {
  const data = useRouteLoaderData('root')
  const cfg = data?.publicRuntime
  if (!cfg) return null
  const json = JSON.stringify(cfg)
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__TEST_PUBLIC__=${json};`,
      }}
    />
  )
}

/**
 * Root layout wrapping all routes with common HTML structure.
 * @param {object} root0 - The component props.
 * @param {import('react').ReactNode} root0.children - The child elements to render within the layout.
 * @returns {import('react').JSX.Element} The HTML document shell with children rendered in the body.
 */
export function Layout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <PublicRuntimeConfigScript />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

/**
 * Top-level application component providing auth, query, and layout contexts.
 * @returns {import('react').JSX.Element} The app wrapped in auth, query, and layout providers.
 */
export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <PageLayout>
          <Outlet />
        </PageLayout>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AuthProvider>
  )
}

/**
 * Global error boundary for unhandled route errors.
 * @param {object} root0 - The error boundary props.
 * @param {unknown} root0.error - The error that was thrown.
 * @returns {import('react').JSX.Element} An error page displaying the error message and optional stack trace.
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main style={{ padding: '1rem', maxWidth: '80rem', margin: '0 auto', paddingTop: '4rem' }}>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre style={{ width: '100%', padding: '1rem', overflowX: 'auto' }}>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
