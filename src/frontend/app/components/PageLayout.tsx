import React, { useState } from 'react'
import { NavLink } from 'react-router'

import { useAuth } from '~/auth.context'
import { ChatModal } from '~/components/ChatModal'
import { UserProfileModal } from '~/components/UserProfileModal'
import './PageLayout.css'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'text-indigo-600 font-semibold dark:text-indigo-400'
    : 'text-indigo-500 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200'

/**
 * PageLayout component.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The children nodes.
 * @returns {React.JSX.Element} The rendered component.
 */
function PageLayout({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  const auth = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <>
      <nav className="flex items-center justify-between px-6 py-3 text-lg border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex gap-6">
          <NavLink className={navLinkClass} to="/" end>Home</NavLink>
          <NavLink className={navLinkClass} to="/about">About</NavLink>
          <NavLink className={navLinkClass} to="/blogs">Blogs</NavLink>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {auth.isAuthenticated && (
            <>
              <button
                className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                onClick={() => setProfileOpen(true)}
              >
                {auth.user?.profile.name ?? auth.user?.profile.email ?? 'Signed in'}
              </button>
              <button
                className="rounded-md px-3 py-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                onClick={() => void auth.signoutRedirect({ post_logout_redirect_uri: window.location.origin })}
              >
                Sign out
              </button>
              {profileOpen && <UserProfileModal onClose={() => setProfileOpen(false)} />}
            </>
          )}
          {!auth.isAuthenticated && !auth.isLoading && (
            <button
              className="rounded-md px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
              onClick={() => void auth.signinRedirect()}
            >
              Sign in
            </button>
          )}
        </div>
      </nav>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">{children}</main>
      {auth.isAuthenticated && <ChatModal />}
    </>
  )
}

export { PageLayout }
