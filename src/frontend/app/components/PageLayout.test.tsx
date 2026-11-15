import { fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { fakeAuth, type FakeAuth, signedIn } from '~test/auth'

import { PageLayout } from './PageLayout'

const state: { auth: FakeAuth } = { auth: fakeAuth() }
vi.mock('react-oidc-context', () => ({ useAuth: () => state.auth }))
vi.mock('./ChatModal', () => ({ ChatModal: () => <aside aria-label="chat" /> }))

/**
 * Renders the layout in a memory router.
 * @param {string} path - The current location.
 */
function renderLayout(path = '/') {
  const router = createMemoryRouter([{ path: '*', element: <PageLayout>{<p>page body</p>}</PageLayout> }], {
    initialEntries: [path],
  })
  render(<RouterProvider router={router} />)
}

describe('PageLayout', () => {
  it('marks the current page in the navigation', () => {
    state.auth = fakeAuth()
    renderLayout('/blogs')

    expect(screen.getByText('page body')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Blogs' })).toHaveClass('font-semibold')
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveClass('font-semibold')
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
  })

  it('offers sign-in when signed out, and no chat', () => {
    state.auth = fakeAuth()
    renderLayout()

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(state.auth.calls).toEqual([{ name: 'signinRedirect' }])
    expect(screen.queryByRole('complementary', { name: 'chat' })).not.toBeInTheDocument()
  })

  it('shows nothing to sign in with while the session loads', () => {
    state.auth = fakeAuth({ isLoading: true })
    renderLayout()
    expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument()
  })

  it('shows the user, the profile, sign-out and the chat when signed in', () => {
    state.auth = signedIn({ name: 'Hans', sub: 'abc' })
    renderLayout()

    expect(screen.getByRole('complementary', { name: 'chat' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Hans' }))
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('heading', { name: 'Profile' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(state.auth.calls).toEqual([
      { name: 'signoutRedirect', args: { post_logout_redirect_uri: globalThis.location.origin } },
    ])
  })

  it.each([
    [{ email: 'h@example.test' }, 'h@example.test'],
    [{}, 'Signed in'],
  ])('names the user by %o', (profile, label) => {
    state.auth = signedIn(profile)
    renderLayout()
    expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
  })
})
