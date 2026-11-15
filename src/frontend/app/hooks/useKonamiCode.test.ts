import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useKonamiCode } from './useKonamiCode'

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
]

const press = (codes: string[]) =>
  act(() => {
    for (const code of codes) globalThis.dispatchEvent(new KeyboardEvent('keydown', { code }))
  })

describe('useKonamiCode', () => {
  it('activates on the sequence', () => {
    const { result } = renderHook(() => useKonamiCode())
    expect(result.current).toBe(false)

    press(KONAMI)
    expect(result.current).toBe(true)

    press(['KeyX'])
    expect(result.current).toBe(true)
  })

  it('accepts the sequence after other keys', () => {
    const { result } = renderHook(() => useKonamiCode())
    press(['KeyQ', 'ArrowUp', ...KONAMI])
    expect(result.current).toBe(true)
  })

  it('stays off for a wrong sequence', () => {
    const { result } = renderHook(() => useKonamiCode())
    press([...KONAMI.slice(0, 9), 'KeyC'])
    expect(result.current).toBe(false)
  })

  it('stops listening on unmount', () => {
    const { result, unmount } = renderHook(() => useKonamiCode())
    unmount()
    press(KONAMI)
    expect(result.current).toBe(false)
  })
})
