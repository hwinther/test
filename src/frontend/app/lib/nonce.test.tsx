import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { NonceContext, useNonce } from './nonce'

describe('useNonce', () => {
  it('is undefined without a provider (the browser)', () => {
    expect(renderHook(() => useNonce()).result.current).toBeUndefined()
  })

  it('reads the nonce the server render provides', () => {
    const { result } = renderHook(() => useNonce(), {
      wrapper: ({ children }) => <NonceContext value="n0nce">{children}</NonceContext>,
    })
    expect(result.current).toBe('n0nce')
  })
})
