import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { fakeAuth, type FakeAuth, signedIn } from '~test/auth'

import { UserProfileModal } from './UserProfileModal'

const state: { auth: FakeAuth } = { auth: fakeAuth() }

vi.mock('react-oidc-context', () => ({ useAuth: () => state.auth }))

/**
 * Renders the modal.
 * @returns {{ closed: string[] }} One entry per onClose call.
 */
function renderModal() {
  const closed: string[] = []
  render(<UserProfileModal onClose={() => closed.push('closed')} />)
  return { closed }
}

describe('UserProfileModal', () => {
  it('shows the claims of the signed-in user', () => {
    state.auth = signedIn({
      name: 'Hans',
      preferred_username: 'hcw',
      email: 'hcw@example.test',
      email_verified: true,
      groups: ['admins', 'family'],
      sub: 'abc-123',
    })
    renderModal()

    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByText('Hans')).toBeInTheDocument()
    expect(screen.getByText('hcw')).toBeInTheDocument()
    expect(screen.getByText('hcw@example.test')).toBeInTheDocument()
    expect(screen.getByText('verified')).toBeInTheDocument()
    expect(screen.getByText('admins')).toBeInTheDocument()
    expect(screen.getByText('family')).toBeInTheDocument()
    expect(screen.getByText('abc-123')).toBeInTheDocument()
  })

  it('takes a single group as a string and leaves out missing claims', () => {
    state.auth = signedIn({ email: 'x@example.test', groups: 'solo', sub: 's' })
    renderModal()

    expect(screen.getByText('solo')).toBeInTheDocument()
    expect(screen.queryByText('Name')).not.toBeInTheDocument()
    expect(screen.queryByText('Username')).not.toBeInTheDocument()
    expect(screen.queryByText('verified')).not.toBeInTheDocument()
  })

  it('shows no groups when the claim is missing', () => {
    state.auth = signedIn({ sub: 's' })
    renderModal()

    expect(screen.queryByText('Groups')).not.toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('closes with the button, not on a click inside', () => {
    state.auth = signedIn({ sub: 's' })
    const { closed } = renderModal()
    fireEvent.click(screen.getByRole('heading', { name: 'Profile' }))
    expect(closed).toEqual([])
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(closed).toEqual(['closed'])
  })

  it('closes on a click on the backdrop', () => {
    state.auth = signedIn({ sub: 's' })
    const { closed } = renderModal()
    fireEvent.click(screen.getByRole('dialog'))
    expect(closed).toEqual(['closed'])
  })
})
