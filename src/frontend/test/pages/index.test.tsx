import { expect, it } from 'vitest'
import { render, screen } from '~test/testUtils'

import Page from '~/routes/home'

it('renders welcome message', () => {
  render(<Page />, { withQueryProvider: true })
  expect(screen.getByText('Home')).toBeInTheDocument()
})
