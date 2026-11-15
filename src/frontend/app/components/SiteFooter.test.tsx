import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SiteFooter } from './SiteFooter'

describe('SiteFooter', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('shows the version and the short commit', () => {
    vi.stubEnv('VITE_APP_VERSION', '1.2.3')
    vi.stubEnv('VITE_GIT_SHA', '0123456789abcdef')
    render(<SiteFooter />)

    expect(screen.getByText('1.2.3 · 0123456')).toHaveAttribute('title', '0123456789abcdef')
  })

  it('shows just the version without a commit', () => {
    vi.stubEnv('VITE_APP_VERSION', '1.2.3')
    vi.stubEnv('VITE_GIT_SHA', '')
    render(<SiteFooter />)

    expect(screen.getByText('1.2.3')).not.toHaveAttribute('title')
  })

  it('says dev build in development without version info', () => {
    vi.stubEnv('VITE_APP_VERSION', '')
    vi.stubEnv('VITE_GIT_SHA', '')
    vi.stubEnv('DEV', true)
    render(<SiteFooter />)

    expect(screen.getByText('dev build')).toBeInTheDocument()
  })

  it('renders nothing in a production build without version info', () => {
    vi.stubEnv('VITE_APP_VERSION', '')
    vi.stubEnv('VITE_GIT_SHA', '')
    vi.stubEnv('DEV', false)
    render(<SiteFooter />)

    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })
})
