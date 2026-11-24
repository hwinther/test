import { describe, expect, it, vi } from 'vitest'

import { LevelLoader } from './level-loader'
import { createInitialGameState } from './mario-game-logic'
import { clearMarioKeyboardInput, handleMarioKeyDown, handleMarioKeyUp } from './mario-keyboard'

/**
 * @returns {object} Keyboard inputs and game callbacks for a test
 */
function createDeps() {
  return {
    editorMode: false,
    fireLatchedRef: { current: false },
    gameStateRef: { current: createInitialGameState(LevelLoader.createEmptyLevel(32, 13)) },
    jumpLatchedRef: { current: false },
    keyStateRef: { current: { down: false, jump: false, left: false, right: false, run: false, up: false } },
    restartOrAdvance: vi.fn(),
    setEditorMode: vi.fn(),
  }
}

describe('Mario keyboard controls', () => {
  it('keeps movement held until all of its physical aliases are released', () => {
    const deps = createDeps()
    const arrow = new KeyboardEvent('keydown', { cancelable: true, code: 'ArrowRight' })
    handleMarioKeyDown(arrow, deps)
    handleMarioKeyDown(new KeyboardEvent('keydown', { code: 'KeyD' }), deps)
    handleMarioKeyUp(new KeyboardEvent('keyup', { code: 'ArrowRight' }), deps.keyStateRef)
    expect(arrow.defaultPrevented).toBe(true)
    expect(deps.keyStateRef.current.right).toBe(true)
    handleMarioKeyUp(new KeyboardEvent('keyup', { code: 'KeyD' }), deps.keyStateRef)
    expect(deps.keyStateRef.current.right).toBe(false)
  })

  it('clears held movement and latches on pause and ignores shortcut repeats', () => {
    const deps = createDeps()
    handleMarioKeyDown(new KeyboardEvent('keydown', { code: 'Space' }), deps)
    expect(deps.jumpLatchedRef.current).toBe(true)
    handleMarioKeyDown(new KeyboardEvent('keydown', { code: 'KeyP' }), deps)
    handleMarioKeyDown(new KeyboardEvent('keydown', { code: 'KeyP', repeat: true }), deps)
    expect(deps.gameStateRef.current.gameStatus).toBe('paused')
    expect(deps.jumpLatchedRef.current).toBe(false)
    expect(deps.keyStateRef.current.jump).toBe(false)

    handleMarioKeyDown(new KeyboardEvent('keydown', { code: 'KeyP' }), deps)
    handleMarioKeyDown(new KeyboardEvent('keydown', { code: 'KeyF' }), deps)
    expect(deps.fireLatchedRef.current).toBe(true)
    clearMarioKeyboardInput(deps)
    expect(deps.fireLatchedRef.current).toBe(false)
  })
})
