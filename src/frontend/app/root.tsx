import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'

import type { Route } from './+types/root'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from '~/auth.context'
import { PageLayout } from '~/components/PageLayout'
import '~/components/PageLayout.css'

const queryClient = new QueryClient()

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
