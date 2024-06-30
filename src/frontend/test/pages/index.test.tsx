import { render, screen } from '~test/testUtils'
import { expect, it } from 'vitest'

import Page from '~/pages/index/+Page'

it('renders welcome message', () => {
  render(<Page />, { mockAuthContext: true, withQueryProvider: true })
  expect(screen.getByText('Vite + React')).toBeInTheDocument()
})
