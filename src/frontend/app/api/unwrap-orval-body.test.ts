import { describe, expect, it } from 'vitest'

import { unwrapOrvalBody } from './unwrap-orval-body'

describe('unwrapOrvalBody', () => {
  it('is undefined for no data', () => {
    expect(unwrapOrvalBody(null)).toBeUndefined()
    expect(unwrapOrvalBody(undefined)).toBeUndefined()
  })

  it('returns arrays and plain entities as they are', () => {
    expect(unwrapOrvalBody([1, 2])).toEqual([1, 2])
    expect(unwrapOrvalBody({ blogId: 1 })).toEqual({ blogId: 1 })
  })

  it('unwraps a 200 envelope, but not another status', () => {
    expect(unwrapOrvalBody({ status: 200, data: { blogId: 1 } })).toEqual({ blogId: 1 })
    expect(unwrapOrvalBody({ status: 404, data: null })).toEqual({ status: 404, data: null })
  })
})
