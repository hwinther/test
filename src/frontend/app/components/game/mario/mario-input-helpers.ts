import type { GameInputSnapshot, GameRef, KeyState } from './mario-types'

/**
 * Merge keyboard state with the first connected gamepad into one input snapshot for a fixed tick.
 * @param {import('./mario-types').KeyState} k - Current held keyboard directions and buttons
 * @param {import('./mario-types').GameRef<boolean>} jumpLatchedRef - One-shot jump from keyboard or gamepad edge
 * @param {import('./mario-types').GameRef<boolean>} fireLatchedRef - One-shot fire from keyboard or gamepad edge
 * @param {import('./mario-types').GameRef<boolean>} gamepadJumpPrevRef - Previous frame A-button state for edge detection
 * @param {import('./mario-types').GameRef<boolean>} gamepadFirePrevRef - Previous frame B-button state for edge detection
 * @returns {import('./mario-types').GameInputSnapshot} Snapshot for `advanceGameState`
 */
export function buildGameInputSnapshot(
  k: KeyState,
  jumpLatchedRef: GameRef<boolean>,
  fireLatchedRef: GameRef<boolean>,
  gamepadJumpPrevRef: GameRef<boolean>,
  gamepadFirePrevRef: GameRef<boolean>,
): GameInputSnapshot {
  let left = k.left
  let right = k.right
  let jumpHeld = k.jump
  let run = k.run
  const down = k.down

  const pads = typeof navigator !== 'undefined' ? navigator.getGamepads() : []
  const pad = pads[0]
  if (pad) {
    const axes = mergeGamepadAxes(pad)
    if (axes.left) {
      left = true
    }
    if (axes.right) {
      right = true
    }
    run = run || axes.runBoost
    const padJump = mergeGamepadJumpFire(pad, gamepadJumpPrevRef, gamepadFirePrevRef, jumpLatchedRef, fireLatchedRef)
    if (padJump) {
      jumpHeld = true
    }
  }

  const jumpPressed = jumpLatchedRef.current
  jumpLatchedRef.current = false
  const firePressed = fireLatchedRef.current
  fireLatchedRef.current = false

  return { down, firePressed, jumpHeld, jumpPressed, left, right, run }
}

/**
 * Read left/right/run from a standard gamepad layout (axes + common face/shoulder mappings).
 * @param {Gamepad} pad - Connected gamepad from `navigator.getGamepads()`
 * @returns {object} Derived movement flags
 */
function mergeGamepadAxes(pad: Gamepad): { left: boolean; right: boolean; runBoost: boolean } {
  const ax = pad.axes[0] ?? 0
  const left = ax < -0.4 || Boolean(pad.buttons[6]?.pressed)
  const right = ax > 0.4 || Boolean(pad.buttons[7]?.pressed)
  const runBoost = Boolean(pad.buttons[10]?.pressed || pad.buttons[2]?.pressed)
  return { left, right, runBoost }
}

/**
 * Detect A/B button edges and merge into jump/fire latch refs.
 * @param {Gamepad} pad - Active gamepad (same instance as passed to `mergeGamepadAxes`)
 * @param {import('./mario-types').GameRef<boolean>} gamepadJumpPrevRef - Stored previous A state
 * @param {import('./mario-types').GameRef<boolean>} gamepadFirePrevRef - Stored previous B state
 * @param {import('./mario-types').GameRef<boolean>} jumpLatchedRef - Latch consumed by `buildGameInputSnapshot`
 * @param {import('./mario-types').GameRef<boolean>} fireLatchedRef - Latch consumed by `buildGameInputSnapshot`
 * @returns {boolean} Whether A is held (for jump-held this tick)
 */
function mergeGamepadJumpFire(
  pad: Gamepad,
  gamepadJumpPrevRef: GameRef<boolean>,
  gamepadFirePrevRef: GameRef<boolean>,
  jumpLatchedRef: GameRef<boolean>,
  fireLatchedRef: GameRef<boolean>,
): boolean {
  const aDown = Boolean(pad.buttons[0]?.pressed)
  const jumpHeldFromPad = aDown
  const jumpEdge = aDown && !gamepadJumpPrevRef.current
  gamepadJumpPrevRef.current = aDown
  if (jumpEdge) {
    jumpLatchedRef.current = true
  }

  const bDown = Boolean(pad.buttons[1]?.pressed)
  const fireEdge = bDown && !gamepadFirePrevRef.current
  gamepadFirePrevRef.current = bDown
  if (fireEdge) {
    fireLatchedRef.current = true
  }

  return jumpHeldFromPad
}
