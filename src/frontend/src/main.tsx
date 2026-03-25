import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AuthProvider } from '~/auth.context'
import * as serviceWorker from '~/serviceWorker'

import { AppRouter } from './router'

const queryClient = new QueryClient()

const rootElement = document.getElementById('root')
if (rootElement != null) {
  createRoot(rootElement).render(
    <StrictMode>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <AppRouter />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </AuthProvider>
    </StrictMode>,
  )
}

serviceWorker.unregister()
