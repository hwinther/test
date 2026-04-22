import { type ReactNode, useEffect } from 'react'
import { AuthProvider as OidcAuthProvider, useAuth } from 'react-oidc-context'

import { setAuthToken } from '~/api/mutators/custom-instance'

/**
 * Keeps the Axios auth token in sync with the OIDC session.
 * Rendered inside OidcAuthProvider so it can read the auth state.
 */
function TokenBridge() {
  const auth = useAuth()
  useEffect(() => {
    setAuthToken(auth.user?.access_token ?? null)
  }, [auth.user?.access_token])
  return null
}

/**
 * Root authentication provider. Wraps the app with OIDC context and bridges
 * the access token into the Axios instance whenever the session changes.
 * @param {object} props - Component props.
 * @param {ReactNode} props.children - Child elements.
 * @returns {import('react').JSX.Element} The OIDC-backed provider tree.
 */
export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const redirectUri =
    typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'https://test.test.wsh.no/auth/callback'

  return (
    <OidcAuthProvider
      authority="https://auth.wsh.no"
      client_id="pxce"
      redirect_uri={redirectUri}
      scope="openid profile email groups offline_access"
      onSigninCallback={() => {
        window.history.replaceState({}, document.title, window.location.pathname)
      }}
    >
      <TokenBridge />
      {children}
    </OidcAuthProvider>
  )
}

export { useAuth }
