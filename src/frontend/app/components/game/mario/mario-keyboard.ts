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

type KeyboardInputRefs = Pick<MarioGameKeyboardDeps, 'fireLatchedRef' | 'jumpLatchedRef' | 'keyStateRef'>

const movementCodes = {
  down: ['ArrowDown', 'KeyS'],
  jump: ['ArrowUp', 'KeyW', 'Space'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  run: ['ShiftLeft', 'ShiftRight'],
  up: ['ArrowUp', 'KeyW', 'Space'],
} satisfies Record<keyof KeyState, string[]>

const heldCodesByRef = new WeakMap<GameRef<KeyState>, Set<string>>()

/**
 * Clear held keys and one-shot actions when gameplay loses keyboard focus.
 * @param {KeyboardInputRefs} refs - Held keys and pending actions
 */
export function clearMarioKeyboardInput(refs: KeyboardInputRefs): void {
  heldCodesByRef.delete(refs.keyStateRef)
  updateHeldKeys(refs.keyStateRef)
  refs.jumpLatchedRef.current = false
  refs.fireLatchedRef.current = false
}

/**
 * Handle gameplay shortcuts and movement within the active game.
 * @param {KeyboardEvent} event - DOM key event
 * @param {MarioGameKeyboardDeps} deps - Refs and callbacks from the game shell
 */
export function handleMarioKeyDown(event: KeyboardEvent, deps: MarioGameKeyboardDeps): void {
  if (event.defaultPrevented || event.isComposing) return

  if (event.code === 'Escape') {
    if (event.repeat) return
    clearMarioKeyboardInput(deps)
    if (deps.editorMode) deps.setEditorMode(false)
    else deps.onClose?.()
    return
  }

  if (deps.editorMode || event.altKey || event.ctrlKey || event.metaKey) return
  if (
    event.target instanceof HTMLElement &&
    (event.target.isContentEditable ||
      event.target.closest('button, a, input, select, textarea, [role="button"], [role="textbox"]'))
  )
    return

  const status = deps.gameStateRef.current.gameStatus
  if (event.code === 'KeyP' && (status === 'playing' || status === 'paused')) {
    if (event.repeat) return
    clearMarioKeyboardInput(deps)
    deps.gameStateRef.current = {
      ...deps.gameStateRef.current,
      gameStatus: status === 'paused' ? 'playing' : 'paused',
    }
    return
  }

  if (status === 'complete' && (event.code === 'Enter' || event.code === 'NumpadEnter')) {
    event.preventDefault()
    if (!event.repeat) deps.restartOrAdvance()
    return
  }

  if (status === 'gameOver' && event.code === 'KeyR') {
    if (!event.repeat) deps.restartOrAdvance()
    return
  }

  if (status !== 'playing') return
  if (event.code === 'KeyE') {
    if (event.repeat) return
    clearMarioKeyboardInput(deps)
    deps.setEditorMode(true)
    return
  }

  if (event.code === 'KeyF' || event.code === 'KeyZ') {
    if (!event.repeat) deps.fireLatchedRef.current = true
    return
  }

  if (!Object.values(movementCodes).some((codes) => codes.includes(event.code))) return
  event.preventDefault()
  if (event.repeat) return

  const heldCodes = heldCodesByRef.get(deps.keyStateRef) ?? new Set<string>()
  const wasJumpHeld = deps.keyStateRef.current.jump
  heldCodes.add(event.code)
  heldCodesByRef.set(deps.keyStateRef, heldCodes)
  updateHeldKeys(deps.keyStateRef)
  if (deps.keyStateRef.current.jump && !wasJumpHeld) deps.jumpLatchedRef.current = true
}

/**
 * Release only the physical key associated with the event.
 * @param {KeyboardEvent} event - DOM keyup
 * @param {import('./mario-types').GameRef<KeyState>} keyStateRef - Held keyboard state
 */
export function handleMarioKeyUp(event: KeyboardEvent, keyStateRef: GameRef<KeyState>): void {
  if (heldCodesByRef.get(keyStateRef)?.delete(event.code)) updateHeldKeys(keyStateRef)
}

/**
 * Update held actions from their physical key aliases.
 * @param {import('./mario-types').GameRef<KeyState>} keyStateRef - Held keyboard state
 */
function updateHeldKeys(keyStateRef: GameRef<KeyState>): void {
  const heldCodes = heldCodesByRef.get(keyStateRef)
  for (const action of Object.keys(movementCodes) as (keyof KeyState)[]) {
    keyStateRef.current[action] = movementCodes[action].some((code) => heldCodes?.has(code))
  }
}
