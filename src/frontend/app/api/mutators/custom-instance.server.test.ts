// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getApiBaseUrl } from './custom-instance'

describe('getApiBaseUrl on the server', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('reads PUBLIC_API_BASE_URL from the process environment', () => {
    vi.stubEnv('PUBLIC_API_BASE_URL', 'https://ssr.test')
    expect(getApiBaseUrl()).toBe('https://ssr.test/')
  })

  it('uses the local default when nothing is set', () => {
    vi.stubEnv('PUBLIC_API_BASE_URL', '')
    vi.stubEnv('VITE_API_BASE_URL', '')
    expect(getApiBaseUrl()).toBe('https://localhost:7156/')
  })
})
