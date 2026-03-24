import type { GameRef, KeyState, MarioGameState } from './mario-types'

/** Dependencies for global Mario game keyboard routing (editor, pause, movement). */
export interface MarioGameKeyboardDeps {
  readonly editorMode: boolean
  readonly fireLatchedRef: GameRef<boolean>
  readonly gameStateRef: GameRef<MarioGameState>
  readonly jumpLatchedRef: GameRef<boolean>
  readonly keyStateRef: GameRef<KeyState>
  readonly onClose?: () => void
  readonly restartOrAdvance: () => void
  readonly setEditorMode: (open: boolean) => void
}

/**
 * Handle a keydown for the Mario game: shortcuts, then movement when not in the editor.
 * @param {KeyboardEvent} event - DOM key event
 * @param {MarioGameKeyboardDeps} d - Refs and callbacks from the game shell
 * @returns {void}
 */
export function handleMarioKeyDown(event: KeyboardEvent, d: MarioGameKeyboardDeps): void {
  if (event.code === 'Escape') {
    handleEscapeKey(d)
    return
  }

  const status = d.gameStateRef.current.gameStatus

  if (event.code === 'KeyR' && (status === 'gameOver' || status === 'complete')) {
    d.restartOrAdvance()
    return
  }

  if (event.code === 'KeyP' && (status === 'playing' || status === 'paused')) {
    d.gameStateRef.current = {
      ...d.gameStateRef.current,
      gameStatus: status === 'paused' ? 'playing' : 'paused',
    }
    return
  }

  if (event.code === 'KeyE' && status === 'playing') {
    d.setEditorMode(true)
    return
  }

  if (d.editorMode) return

  applyMovementKeyDown(event, d.keyStateRef, d.jumpLatchedRef, d.fireLatchedRef)
}

/**
 * Handle a keyup for movement keys only.
 * @param {KeyboardEvent} event - DOM key event
 * @param {import('./mario-types').GameRef<KeyState>} keyStateRef - Mutable keyboard held-state
 * @returns {void}
 */
export function handleMarioKeyUp(event: KeyboardEvent, keyStateRef: GameRef<KeyState>): void {
  applyMovementKeyUp(event, keyStateRef)
}

/**
 * Apply movement-related keydown codes to the mutable key state and jump/fire latches.
 * @param {KeyboardEvent} event - DOM keydown
 * @param {import('./mario-types').GameRef<KeyState>} keyStateRef - Held keys for the sim loop
 * @param {import('./mario-types').GameRef<boolean>} jumpLatchedRef - Edge-triggered jump
 * @param {import('./mario-types').GameRef<boolean>} fireLatchedRef - Edge-triggered fireball
 * @returns {void}
 */
function applyMovementKeyDown(
  event: KeyboardEvent,
  keyStateRef: GameRef<KeyState>,
  jumpLatchedRef: GameRef<boolean>,
  fireLatchedRef: GameRef<boolean>,
): void {
  switch (event.code) {
    case 'ArrowDown':
    case 'KeyS':
      keyStateRef.current.down = true
      break
    case 'ArrowLeft':
    case 'KeyA':
      keyStateRef.current.left = true
      break
    case 'ArrowRight':
    case 'KeyD':
      keyStateRef.current.right = true
      break
    case 'ArrowUp':
    case 'KeyW':
    case 'Space':
      if (!event.repeat) {
        keyStateRef.current.jump = true
        keyStateRef.current.up = true
        jumpLatchedRef.current = true
      }
      event.preventDefault()
      break
    case 'KeyF':
    case 'KeyZ':
      if (!event.repeat) fireLatchedRef.current = true
      break
    case 'ShiftLeft':
    case 'ShiftRight':
      keyStateRef.current.run = true
      break
    default:
      break
  }
}

/**
 * Clear held movement keys on keyup.
 * @param {KeyboardEvent} event - DOM keyup
 * @param {import('./mario-types').GameRef<KeyState>} keyStateRef - Held keys for the sim loop
 * @returns {void}
 */
function applyMovementKeyUp(event: KeyboardEvent, keyStateRef: GameRef<KeyState>): void {
  switch (event.code) {
    case 'ArrowDown':
    case 'KeyS':
      keyStateRef.current.down = false
      break
    case 'ArrowLeft':
    case 'KeyA':
      keyStateRef.current.left = false
      break
    case 'ArrowRight':
    case 'KeyD':
      keyStateRef.current.right = false
      break
    case 'ArrowUp':
    case 'KeyW':
    case 'Space':
      keyStateRef.current.jump = false
      keyStateRef.current.up = false
      break
    case 'ShiftLeft':
    case 'ShiftRight':
      keyStateRef.current.run = false
      break
    default:
      break
  }
}

/**
 * Close editor or exit the game when Escape is pressed.
 * @param {MarioGameKeyboardDeps} d - Keyboard routing dependencies
 * @returns {void}
 */
function handleEscapeKey(d: MarioGameKeyboardDeps): void {
  if (d.editorMode) {
    d.setEditorMode(false)
  } else {
    d.onClose?.()
  }
}
