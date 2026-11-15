/** What a test's `useAuth()` returns; mutate it before rendering. */
export interface FakeAuth {
  isAuthenticated: boolean
  isLoading: boolean
  user: { access_token?: string; profile: Record<string, unknown> } | null
  signinRedirect: () => Promise<void>
  signoutRedirect: (args?: unknown) => Promise<void>
  calls: { name: 'signinRedirect' | 'signoutRedirect'; args?: unknown }[]
}

/**
 * A signed-out auth state that records sign-in and sign-out calls. Use it from a
 * `vi.mock('react-oidc-context', …)` factory with a plain function (mockReset resets vi.fn).
 * @param {Partial<FakeAuth>} overrides - Fields to set.
 * @returns {FakeAuth} The fake.
 */
export function fakeAuth(overrides: Partial<FakeAuth> = {}): FakeAuth {
  const fake: FakeAuth = {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    calls: [],
    signinRedirect: () => {
      fake.calls.push({ name: 'signinRedirect' })
      return Promise.resolve()
    },
    signoutRedirect: (args) => {
      fake.calls.push({ name: 'signoutRedirect', args })
      return Promise.resolve()
    },
    ...overrides,
  }
  return fake
}

/**
 * A signed-in auth state.
 * @param {Record<string, unknown>} profile - The id token claims.
 * @param {string} token - The access token.
 * @returns {FakeAuth} The fake.
 */
export const signedIn = (profile: Record<string, unknown>, token = 'token-1'): FakeAuth =>
  fakeAuth({ isAuthenticated: true, user: { access_token: token, profile } })
