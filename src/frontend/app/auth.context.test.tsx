// cspell:ignore pxce
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fakeAuth, type FakeAuth, signedIn } from '~test/auth'

import { AuthProvider } from './auth.context'

const state: { auth: FakeAuth; providerProps: Record<string, unknown> | null; tokens: (string | null)[] } = {
  auth: fakeAuth(),
  providerProps: null,
  tokens: [],
}

vi.mock('react-oidc-context', () => ({
  useAuth: () => state.auth,
  AuthProvider: ({ children, ...props }: { children: ReactNode }) => {
    state.providerProps = props
    return <>{children}</>
  },
}))
vi.mock('~/api/mutators/custom-instance', () => ({
  setAuthToken: (token: string | null) => state.tokens.push(token),
}))

describe('AuthProvider', () => {
  it('configures the OIDC client for this origin and renders the app', () => {
    state.auth = fakeAuth()
    state.tokens = []
    render(
      <AuthProvider>
        <p>app</p>
      </AuthProvider>,
    )

    expect(screen.getByText('app')).toBeInTheDocument()
    expect(state.providerProps).toMatchObject({
      authority: 'https://auth.wsh.no',
      client_id: 'pxce',
      redirect_uri: `${globalThis.location.origin}/auth/callback`,
      scope: 'openid profile email groups offline_access',
    })
    expect(state.tokens).toEqual([null])
  })

  it('passes the access token on, and strips the callback query after sign-in', () => {
    state.auth = signedIn({ sub: 'u' }, 'tok-1')
    state.tokens = []
    globalThis.history.pushState({}, '', '/auth/callback?code=abc&state=x')
    render(
      <AuthProvider>
        <p>app</p>
      </AuthProvider>,
    )

    expect(state.tokens).toEqual(['tok-1'])
    ;(state.providerProps!.onSigninCallback as () => void)()
    expect(globalThis.location.search).toBe('')
    expect(globalThis.location.pathname).toBe('/auth/callback')
  })
})
