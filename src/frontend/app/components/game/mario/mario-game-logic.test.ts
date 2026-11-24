import type { GameInputSnapshot, MarioGameState } from './mario-types'

import { describe, expect, it, vi } from 'vitest'

import { startBotvarProofroom } from './botvar-proofroom'
import { LevelLoader } from './level-loader'
import { advanceGameState, createInitialGameState } from './mario-game-logic'

vi.mock('./mario-sounds', () => ({ playMarioSound: vi.fn() }))

const idle: GameInputSnapshot = {
  down: false,
  firePressed: false,
  jumpHeld: false,
  jumpPressed: false,
  left: false,
  right: false,
  run: false,
}

/**
 * @returns {object} Initial simulation after landing on the test floor
 */
function createTestState(): MarioGameState {
  const level = LevelLoader.createEmptyLevel(40, 15)
  level.startPosition = { x: 20, y: 13 }
  level.metadata.timeLimit = 60
  level.tiles[14] = level.tiles[14].map((tile) => ({ ...tile, type: 'ground' }))
  return advanceGameState(createInitialGameState(level), idle)
}

describe('Mario simulation', () => {
  it('accelerates into movement and keeps its feet planted when running into a wall', () => {
    let state = createTestState()
    state.platforms.push({
      breakable: false,
      height: 32,
      id: 'pipe',
      solid: true,
      type: 'pipe',
      width: 32,
      x: 704,
      y: state.player.y,
    })
    const right = { ...idle, right: true, run: true }
    state = advanceGameState(state, right)
    expect(state.player.velocityX).toBeGreaterThan(0)
    expect(state.player.velocityX).toBeLessThan(4.5)

    const initialY = state.player.y
    for (let frame = 0; frame < 30; frame++) state = advanceGameState(state, right)
    expect(state.player).toMatchObject({ onGround: true, velocityX: 0, x: 672, y: initialY })
  })

  it('supports both a short tap and a held jump without retriggering from a held key', () => {
    const standing = createTestState()
    let tap = advanceGameState(standing, { ...idle, jumpPressed: true })
    let held = advanceGameState(standing, { ...idle, jumpHeld: true, jumpPressed: true })

    for (let frame = 0; frame < 12; frame++) {
      tap = advanceGameState(tap, idle)
      held = advanceGameState(held, { ...idle, jumpHeld: true })
    }
    expect(held.player.y).toBeLessThan(tap.player.y - 40)
    expect(tap.player.y).toBeLessThan(standing.player.y)

    for (let frame = 0; frame < 60; frame++) held = advanceGameState(held, { ...idle, jumpHeld: true })
    expect(held.player).toMatchObject({ onGround: true, y: standing.player.y })
  })

  it('uses the level start and clears movement and timers when a fall costs a life', () => {
    const state = createTestState()
    state.player.y = state.levelHeight + 1
    state.player.powerUp = 'fire'
    state.player.velocityX = 4
    state.jumpBufferFrames = 3
    state.starPowerUntil = 1000
    state.timeRemaining = 0.001

    const next = advanceGameState(state, idle)
    expect(next.player).toMatchObject({
      invulnerable: true,
      lives: 2,
      powerUp: 'small',
      velocityX: 0,
      velocityY: 0,
      x: 640,
      y: 416,
    })
    expect(next).toMatchObject({
      cameraX: 240,
      jumpBufferFrames: 0,
      starPowerUntil: 0,
      timeRemaining: 60,
    })
  })

  it('freezes active simulation and timed powers during pause', () => {
    const state = createTestState()
    state.starPowerUntil = 1000
    const active = advanceGameState(state, idle)
    const paused = { ...active, gameStatus: 'paused' as const }
    expect(active.player.invulnerable).toBe(true)
    expect(advanceGameState(paused, { ...idle, jumpPressed: true })).toBe(paused)

    let resumed = advanceGameState({ ...paused, gameStatus: 'playing' }, idle)
    expect(resumed.player.invulnerable).toBe(true)
    for (let frame = 0; frame < 60; frame++) resumed = advanceGameState(resumed, idle)
    expect(resumed.player.invulnerable).toBe(false)
  })

  it('lets a reached flag complete even if the level clock was about to expire', () => {
    let state = createTestState()
    state.timeRemaining = 0.001
    state.flagPole.x = state.player.x
    state.flagPole.y = state.player.y
    state = advanceGameState(state, idle)
    expect(state.flagPole.reached).toBe(true)

    for (let frame = 0; frame < 31; frame++) state = advanceGameState(state, idle)
    expect(state.gameStatus).toBe('complete')
    expect(state.player.lives).toBe(3)
  })

  it('requires both text corrections and returns to the publication course with its clock running', () => {
    const course = createInitialGameState(LevelLoader.createWorld1Dash3Level(), {
      levelNumber: 3,
      score: 800,
      spriteTheme: 'botvar',
    })
    let state = startBotvarProofroom(course)
    const right = { ...idle, right: true }
    const jumpRight = { ...right, jumpHeld: true }

    const blockedExit = advanceGameState({ ...state, player: { ...state.player, x: 660 } }, idle)
    expect(blockedExit.proofroom).toBeDefined()

    for (let frame = 0; frame < 15; frame++) state = advanceGameState(state, right)
    state = advanceGameState(state, { ...jumpRight, jumpPressed: true })
    for (let frame = 1; frame < 40; frame++) state = advanceGameState(state, jumpRight)
    expect(state.proofroom?.marks.map(({ collected }) => collected)).toEqual([true, false])

    for (let frame = 0; frame < 20; frame++) state = advanceGameState(state, right)
    state = advanceGameState(state, { ...jumpRight, jumpPressed: true })
    for (let frame = 1; frame < 50; frame++) state = advanceGameState(state, jumpRight)
    expect(state.proofroom?.marks.map(({ collected }) => collected)).toEqual([true, true])

    for (let frame = 0; frame < 80 && state.proofroom; frame++) state = advanceGameState(state, right)
    expect(state.proofroom).toBeUndefined()
    expect(state.player).toMatchObject({ ...course.spawnPosition, lives: course.player.lives })
    expect(state.furthestX).toBe(course.spawnPosition.x)
    expect(state.score).toBe(course.score)
    expect(state.gameStatus).toBe('playing')
    expect(state.level).toBe(3)
    expect(state.gameTime).toBeGreaterThan(2)
    expect(state.platforms).toBe(course.platforms)
  })
})
