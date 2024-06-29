import { expect, it } from 'vitest'

import { render, screen } from '~/test/testUtils'

import Page from '../+Page'

it('renders welcome message', () => {
  render(<Page />, { mockAuthContext: true, withQueryProvider: true })
  expect(screen.getByText('Vite + React')).toBeInTheDocument()
})
