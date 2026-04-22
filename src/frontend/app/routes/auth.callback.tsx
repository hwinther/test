import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from 'react-oidc-context'

/**
 * Handles the OIDC redirect callback. The AuthProvider automatically exchanges
 * the code for tokens; this component navigates home once that completes.
 * @returns {import('react').JSX.Element} A status message shown during the exchange.
 */
export default function AuthCallback() {
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth.isLoading && !auth.error) {
      void navigate('/', { replace: true })
    }
  }, [auth.isLoading, auth.error, navigate])

  if (auth.error) {
    return (
      <div className="p-8 text-center space-y-2">
        <p className="text-red-600 font-medium">Authentication failed</p>
        <p className="text-sm text-neutral-500">{auth.error.message}</p>
      </div>
    )
  }

  return (
    <div className="p-8 text-center text-neutral-500">Completing sign-in…</div>
  )
}
