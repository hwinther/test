// https://vike.dev/onRenderClient
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { type PageContext } from 'vike/types'

import { AuthProvider } from '../auth.context'
import * as serviceWorker from '../serviceWorker'
import { PageLayout } from './PageLayout'

const queryClient = new QueryClient()

// if (process.env.NODE_ENV === 'development') {
//   require('./mock');
// }

/**
 * Renders the client-side page.
 * @param {PageContext} pageContext - The page context.
 */
async function onRenderClient(pageContext: PageContext): Promise<void> {
  const { Page }: { Page: any } = pageContext
  const rootElement = document.getElementById('root')
  if (rootElement != null) {
    createRoot(rootElement).render(
      <StrictMode>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <PageLayout>
              <Page />
              <ReactQueryDevtools initialIsOpen={false} />
            </PageLayout>
          </QueryClientProvider>
        </AuthProvider>
      </StrictMode>,
    )
  } else {
    console.error('No root element found')
  }
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()

export { onRenderClient }
