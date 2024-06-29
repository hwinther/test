import React from 'react'
import { type PageContext } from 'vike/types'
import { usePageContext } from 'vike-react/usePageContext'

/**
 * Page component.
 * @returns {React.JSX.Element} The rendered component.
 */
function Page(): React.JSX.Element {
  const pageContext = usePageContext() as ExtendedPageContext & PageContext

  let msg: string // Message shown to the user
  const { abortReason, abortStatusCode } = pageContext
  if (typeof abortReason === 'object' && abortReason?.notAdmin) {
    // Handle `throw render(403, { notAdmin: true })`
    msg = "You cannot access this page because you aren't an administrator."
  } else if (typeof abortReason === 'string') {
    // Handle `throw render(abortStatusCode, `You cannot access ${someCustomMessage}`)`
    msg = abortReason
  } else if (abortStatusCode === 403) {
    // Handle `throw render(403)`
    msg = "You cannot access this page because you don't have enough privileges."
  } else if (abortStatusCode === 401) {
    // Handle `throw render(401)`
    msg = "You cannot access this page because you aren't logged in. Please log in."
  } else {
    // Fallback error message
    msg =
      pageContext.is404 ?? false
        ? "This page doesn't exist."
        : 'Something went wrong. Sincere apologies. Try again (later).'
  }

  return (
    <Center>
      <p style={{ fontSize: '1.3em' }}>{msg}</p>
    </Center>
  )
}

/**
 * Center component.
 * @param {Readonly<{ children: React.ReactNode }>} props - The component props.
 * @returns {React.JSX.Element} The rendered component.
 */
function Center({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        height: 'calc(100vh - 100px)',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  )
}

export interface ExtendedPageContext {
  abortReason?: { notAdmin: true } | string
}

export default Page
