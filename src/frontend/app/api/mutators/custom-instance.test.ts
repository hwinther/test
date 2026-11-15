import type { InternalAxiosRequestConfig } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AXIOS_INSTANCE, customInstance, getApiBaseUrl, setAuthToken } from './custom-instance'

describe('getApiBaseUrl in the browser', () => {
  afterEach(() => {
    delete globalThis.window.__TEST_PUBLIC__
    vi.unstubAllEnvs()
  })

  it('prefers the config injected into the page, with a trailing slash', () => {
    globalThis.window.__TEST_PUBLIC__ = {
      apiBaseUrl: ' https://api.test ',
      otelServiceName: '',
      otelTracesEndpoint: '',
    }
    expect(getApiBaseUrl()).toBe('https://api.test/')
    globalThis.window.__TEST_PUBLIC__.apiBaseUrl = 'https://api.test/v/'
    expect(getApiBaseUrl()).toBe('https://api.test/v/')
  })

  it('falls back to VITE_API_BASE_URL, then the local default', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://vite.test')
    expect(getApiBaseUrl()).toBe('https://vite.test/')
    vi.stubEnv('VITE_API_BASE_URL', 'https://vite.test/')
    expect(getApiBaseUrl()).toBe('https://vite.test/')
    vi.stubEnv('VITE_API_BASE_URL', '')
    expect(getApiBaseUrl()).toBe('https://localhost:7156/')
  })
})

describe('customInstance', () => {
  let seen: InternalAxiosRequestConfig[]

  beforeEach(() => {
    seen = []
    AXIOS_INSTANCE.defaults.adapter = (config) => {
      seen.push(config)
      return Promise.resolve({ data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config })
    }
  })

  afterEach(() => {
    setAuthToken(null)
    delete AXIOS_INSTANCE.defaults.adapter
  })

  it('returns the body, sends the fetch-style body as data, and no token when signed out', async () => {
    await expect(customInstance('/api/x', { method: 'POST', body: '{"a":1}' })).resolves.toEqual({ ok: true })

    expect(seen[0]!.url).toBe('/api/x')
    expect(seen[0]!.data).toBe('{"a":1}')
    expect(seen[0]!.headers.Authorization).toBeUndefined()
  })

  it('adds the bearer token once set', async () => {
    setAuthToken('tok')
    await customInstance('/api/x')
    expect(seen[0]!.headers.Authorization).toBe('Bearer tok')
    expect(seen[0]!.data).toBeUndefined()
  })

  it('aborts when the caller aborts', async () => {
    const caller = new AbortController()
    await customInstance('/api/x', { signal: caller.signal })
    expect(seen[0]!.signal?.aborted).toBe(false)
    caller.abort()
    expect(seen[0]!.signal?.aborted).toBe(true)
  })

  it('aborts the request when the returned promise is cancelled', async () => {
    const request = customInstance('/api/x')
    request.cancel()
    // Axios checks the signal before it sends, so a cancelled request never reaches the adapter.
    await expect(request).rejects.toMatchObject({ name: 'CanceledError' })
    expect(seen).toHaveLength(0)
  })
})
