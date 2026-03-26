/* eslint-disable sonarjs/pseudo-random */
import type { LevelData } from './level-format'
import type { Enemy, Fireball, GameInputSnapshot, LevelTheme, MarioGameState, Player, SpriteTheme } from './mario-types'

import { LevelLoader } from './level-loader'
import { playMarioSound } from './mario-sounds'

/** Fixed canvas width in CSS pixels (matches `<canvas width>`). */
export const MARIO_CANVAS_WIDTH = 800
/** Fixed canvas height in CSS pixels (matches `<canvas height>`). */
export const MARIO_CANVAS_HEIGHT = 400

/** Simulation step duration in seconds (60 Hz fixed tick). */
const FIXED_DT = 1 / 60
export { FIXED_DT }

const GRAVITY = 0.5
const PLAYER_SPEED = 3
const JUMP_FORCE = 12
const RUN_MULTIPLIER = 1.5
const JUMP_CUT_MULTIPLIER = 0.45
const COYOTE_MAX = 7
const JUMP_BUFFER_MAX = 10
const INVULN_MS = 2000
const STAR_MS = 10_000
const FIRE_COOLDOWN_FRAMES = 18
const PLAYER_W = 32
const SMALL_H = 32
const BIG_H = 48

/** Points for jumping on a walkable enemy (Goomba / Koopa). */
const SCORE_STOMP_ENEMY = 200
/** Points for defeating an enemy with a fireball or while invincible (star). */
const SCORE_FIRE_OR_STAR_ENEMY = 200

/**
 * True when the player is coming down onto the enemy’s head (not rising through or side-bumping).
 * @param {import('./mario-types').Player} player - Mario after movement this tick
 * @param {import('./mario-types').Enemy} enemy - Grounded enemy hitbox
 * @returns {boolean} Whether to treat contact as a stomp
 */
function isStompFromAbove(player: Player, enemy: Enemy): boolean {
  if (player.velocityY < -0.5) return false
  const feet = player.y + player.height
  const penetration = feet - enemy.y
  const maxPen = Math.min(22, enemy.height * 0.65)
  if (penetration < 0 || penetration > maxPen) return false
  if (player.velocityY > 0) return true
  return penetration <= 14
}

/**
 * Award score and floating “+pts” for an enemy defeat; increments `enemiesDefeated`.
 * @param {import('./mario-types').MarioGameState} state - Game state to mutate
 * @param {number} points - Amount to add to `score`
 * @param {number} popupX - World X for the pop-up text
 * @param {number} popupY - World Y for the pop-up text
 * @param {number} now - Timestamp for particle id
 * @param {string} idSuffix - Disambiguates particle ids
 * @returns {void}
 */
function awardEnemyScore(
  state: MarioGameState,
  points: number,
  popupX: number,
  popupY: number,
  now: number,
  idSuffix: string,
): void {
  state.score += points
  state.enemiesDefeated++
  playMarioSound('stomp')
  state.particles.push({
    id: `score-${idSuffix}-${now}`,
    life: 32,
    maxLife: 32,
    type: 'score',
    value: points,
    velocityX: (Math.random() - 0.5) * 0.8,
    velocityY: -1.5,
    x: popupX,
    y: popupY,
  })
}

/**
 * Advance simulation by one fixed tick: input, movement, collisions, entities, timers.
 * @param {import('./mario-types').MarioGameState} prev - State at the start of the tick
 * @param {import('./mario-types').GameInputSnapshot} input - Keyboard/gamepad snapshot for this tick
 * @param {number} now - `performance.now()` for invulnerability and star timers
 * @returns {import('./mario-types').MarioGameState} New state for the next frame
 */
export function advanceGameState(prev: MarioGameState, input: GameInputSnapshot, now: number): MarioGameState {
  if (prev.gameStatus === 'paused') {
    return { ...prev, player: { ...prev.player, invulnerable: now < prev.invulnerableUntil } }
  }

  if (prev.gameStatus !== 'playing') {
    if (prev.pendingCompleteAt !== null && now >= prev.pendingCompleteAt) {
      return { ...prev, gameStatus: 'complete', pendingCompleteAt: null }
    }
    return prev
  }

  const newState: MarioGameState = {
    ...prev,
    collectibles: prev.collectibles.map((c) => ({ ...c })),
    enemies: prev.enemies.map((e) => ({ ...e })),
    fireballs: prev.fireballs.map((f) => ({ ...f })),
    flagPole: {
      ...prev.flagPole,
      flag: { ...prev.flagPole.flag },
    },
    particles: prev.particles.map((p) => ({ ...p })),
    platforms: prev.platforms.map((p) => ({ ...p })),
    player: { ...prev.player },
  }

  const player = newState.player
  const starActive = now < newState.starPowerUntil
  player.invulnerable = now < newState.invulnerableUntil || starActive

  if (input.jumpPressed) {
    newState.jumpBufferFrames = JUMP_BUFFER_MAX
  } else {
    newState.jumpBufferFrames = Math.max(0, newState.jumpBufferFrames - 1)
  }

  const wasOnGround = player.onGround

  if (wasOnGround) {
    player.coyoteFrames = COYOTE_MAX
  }

  player.isRunning = input.run
  const speed = player.isRunning ? PLAYER_SPEED * RUN_MULTIPLIER : PLAYER_SPEED

  if (input.left) {
    player.velocityX = -speed
    player.facing = 'left'
  } else if (input.right) {
    player.velocityX = speed
    player.facing = 'right'
  } else {
    player.velocityX *= 0.8
  }

  const canJump = player.onGround || player.coyoteFrames > 0
  if (newState.jumpBufferFrames > 0 && canJump) {
    player.velocityY = -JUMP_FORCE
    player.isJumping = true
    player.onGround = false
    newState.jumpBufferFrames = 0
    player.coyoteFrames = 0
    playMarioSound('jump')
  }

  if (!input.jumpHeld && player.velocityY < 0) {
    player.velocityY *= JUMP_CUT_MULTIPLIER
  }

  player.velocityY += GRAVITY

  player.x += player.velocityX
  player.y += player.velocityY

  const platformsToRemove = new Set<string>()
  player.onGround = false

  for (const platform of newState.platforms) {
    if (!platform.solid) continue
    if (!checkCollision(player, platform)) continue

    if (player.velocityY < 0 && player.y > platform.y) {
      if (platform.breakable && player.powerUp !== 'small') {
        platformsToRemove.add(platform.id)
        player.y = platform.y + platform.height
        player.velocityY = 0
        newState.score += 50
        playMarioSound('stomp')
        for (let i = 0; i < 6; i++) {
          newState.particles.push({
            id: `brick-${platform.id}-${i}-${now}`,
            life: 25,
            maxLife: 25,
            type: 'brick',
            velocityX: (Math.random() - 0.5) * 5,
            velocityY: -2 - Math.random() * 2,
            x: platform.x + Math.random() * platform.width,
            y: platform.y + platform.height / 2,
          })
        }
        continue
      }
      player.y = platform.y + platform.height
      player.velocityY = 0
      continue
    }

    if (player.velocityY > 0 && player.y < platform.y) {
      player.y = platform.y - player.height
      player.velocityY = 0
      player.onGround = true
      player.isJumping = false
      continue
    }

    if (player.velocityX > 0 && player.x < platform.x) {
      player.x = platform.x - player.width
    } else if (player.velocityX < 0 && player.x > platform.x) {
      player.x = platform.x + platform.width
    }
  }

  if (platformsToRemove.size > 0) {
    newState.platforms = newState.platforms.filter((p) => !platformsToRemove.has(p.id))
  }

  if (player.x < 0) player.x = 0
  if (player.x > newState.levelWidth - player.width) {
    player.x = newState.levelWidth - player.width
  }

  if (!player.onGround) {
    player.coyoteFrames = Math.max(0, player.coyoteFrames - 1)
  }

  if (player.y > newState.levelHeight) {
    player.lives--
    playMarioSound('damage')
    if (player.lives <= 0) {
      newState.gameStatus = 'gameOver'
    } else {
      player.x = 50
      player.y = 200
      player.velocityX = 0
      player.velocityY = 0
      newState.invulnerableUntil = now + INVULN_MS
    }
  }

  const targetCameraX = player.x - MARIO_CANVAS_WIDTH / 2
  newState.cameraX = Math.max(0, Math.min(targetCameraX, newState.levelWidth - MARIO_CANVAS_WIDTH))

  if (newState.fireCooldownFrames > 0) newState.fireCooldownFrames--

  if (
    input.firePressed &&
    player.powerUp === 'fire' &&
    newState.fireCooldownFrames <= 0 &&
    newState.fireballs.length < 4
  ) {
    newState.fireCooldownFrames = FIRE_COOLDOWN_FRAMES
    const dir = player.facing === 'right' ? 1 : -1
    newState.fireballs.push({
      height: 10,
      id: `fb-${now}`,
      velocityX: dir * 7,
      velocityY: 0,
      width: 10,
      x: player.x + (dir > 0 ? player.width : -10),
      y: player.y + player.height / 2 - 5,
    })
    playMarioSound('fire')
  }

  newState.fireballs = updateFireballs(newState, now)

  newState.enemies = updateEnemies(newState, player, now, starActive)

  updateCollectibles(newState, player, now)

  newState.particles = newState.particles
    .map((particle) => ({
      ...particle,
      life: particle.life - 1,
      x: particle.x + particle.velocityX,
      y: particle.y + particle.velocityY,
    }))
    .filter((particle) => particle.life > 0)

  checkFlagPole(newState, player, now)

  newState.gameTime += FIXED_DT

  if (newState.gameStatus === 'playing' && newState.pendingCompleteAt !== null && now >= newState.pendingCompleteAt) {
    newState.gameStatus = 'complete'
    newState.pendingCompleteAt = null
  }

  if (newState.timeRemaining !== null) {
    newState.timeRemaining = Math.max(0, newState.timeRemaining - FIXED_DT)
    if (newState.timeRemaining <= 0 && newState.gameStatus === 'playing') {
      player.lives--
      playMarioSound('damage')
      if (player.lives <= 0) {
        newState.gameStatus = 'gameOver'
      } else {
        newState.timeRemaining = newState.timeLimitMax
        player.x = 50
        player.y = 200
        player.velocityX = 0
        player.velocityY = 0
        newState.invulnerableUntil = now + INVULN_MS
      }
    }
  }

  newState.player = player
  return newState
}

/**
 * Build runtime state from level JSON, optionally carrying score/lives between levels.
 * @param {import('./level-format').LevelData} levelData - Level definition to parse
 * @param {object} [options] - Optional carry-over or display overrides
 * @param {number} [options.levelNumber] - Shown “world” number in the HUD
 * @param {number} [options.lives] - Starting lives (sequence progression)
 * @param {number} [options.score] - Starting score (sequence progression)
 * @param {import('./mario-types').SpriteTheme} [options.spriteTheme] - Visual theme for sprites ('classic' | 'botvar')
 * @returns {import('./mario-types').MarioGameState} Initial playing state
 */
export function createInitialGameState(
  levelData: LevelData,
  options?: { levelNumber?: number; lives?: number; score?: number; spriteTheme?: SpriteTheme },
): MarioGameState {
  const parsed = LevelLoader.parseLevel(levelData)
  const tileSize = levelData.dimensions.tileSize
  const lw = levelData.dimensions.width * tileSize
  const lh = levelData.dimensions.height * tileSize
  const flagPole = parsed.flagPole ?? defaultFlagPole(lw, tileSize)
  const theme = (parsed.levelTheme || 'overworld') as LevelTheme
  const timeLimit = levelData.metadata.timeLimit ?? null

  const player = { ...parsed.player! }
  player.coyoteFrames = 0
  if (options?.lives !== undefined) player.lives = options.lives
  setPlayerSizeForPower(player)

  return {
    cameraX: 0,
    coinsCollected: 0,
    collectibles: parsed.collectibles!,
    enemies: parsed.enemies!,
    enemiesDefeated: 0,
    fireballs: [],
    fireCooldownFrames: 0,
    flagPole,
    gameStatus: 'playing',
    gameTime: 0,
    invulnerableUntil: 0,
    jumpBufferFrames: 0,
    level: options?.levelNumber ?? 1,
    levelHeight: lh,
    levelTheme: theme,
    levelWidth: lw,
    particles: [],
    pendingCompleteAt: null,
    platforms: parsed.platforms!,
    player,
    score: options?.score ?? 0,
    spriteTheme: options?.spriteTheme ?? 'classic',
    starPowerUntil: 0,
    timeLimitMax: timeLimit,
    timeRemaining: timeLimit,
  }
}

/**
 * Map level theme metadata to sky/ground colors for canvas rendering.
 * @param {import('./mario-types').LevelTheme} theme - Theme id from level JSON
 * @returns {{ sky: string; ground: string }} CSS color strings
 */
export function themeColors(theme: LevelTheme): {
  ground: string
  sky: string
} {
  switch (theme) {
    case 'castle':
      return { ground: '#2d2d2d', sky: '#3d0000' }
    case 'underground':
      return { ground: '#4a3728', sky: '#1a1a2e' }
    case 'underwater':
      return { ground: '#c4a574', sky: '#1e5f8a' }
    default:
      return { ground: '#8B4513', sky: '#87CEEB' }
  }
}

/**
 * Handle one enemy/body hit: shrink power tier or lose a life; start invulnerability.
 * @param {import('./mario-types').MarioGameState} state - Mutable game state
 * @param {import('./mario-types').Player} player - Player entity
 * @param {number} now - Current `performance.now()` time
 * @returns {void}
 */
function applyPlayerDamage(state: MarioGameState, player: Player, now: number): void {
  if (now < state.invulnerableUntil) return

  if (player.powerUp === 'fire') {
    player.powerUp = 'big'
    setPlayerSizeForPower(player)
    state.invulnerableUntil = now + INVULN_MS
    playMarioSound('damage')
  } else if (player.powerUp === 'big') {
    player.powerUp = 'small'
    setPlayerSizeForPower(player)
    state.invulnerableUntil = now + INVULN_MS
    playMarioSound('damage')
  } else {
    player.lives--
    state.invulnerableUntil = now + INVULN_MS
    playMarioSound('damage')
    if (player.lives <= 0) {
      state.gameStatus = 'gameOver'
    }
  }
}

/* eslint-disable jsdoc/require-param -- rects are plain `{ x, y, width, height }` records */
/**
 * Axis-aligned rectangle intersection in level pixel space.
 * @param {{ x: number; y: number; width: number; height: number }} rect1 - First bounds in pixels
 * @param {{ x: number; y: number; width: number; height: number }} rect2 - Second bounds in pixels
 * @returns {boolean} True when rectangles overlap
 */
function checkCollision(
  rect1: { height: number; width: number; x: number; y: number },
  rect2: { height: number; width: number; x: number; y: number },
): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  )
}
/* eslint-enable jsdoc/require-param */

/**
 * When the player touches the flag, award score and schedule level-complete.
 * @param {import('./mario-types').MarioGameState} state - Mutable game state
 * @param {import('./mario-types').Player} player - Player bounds for scoring height
 * @param {number} now - Timestamp for particle ids and pending completion
 * @returns {void}
 */
function checkFlagPole(state: MarioGameState, player: Player, now: number): void {
  if (state.flagPole.reached || !checkCollision(player, state.flagPole)) return

  state.flagPole.reached = true
  playMarioSound('flag')

  const flagPoleHeight = state.flagPole.height
  const playerHeightOnPole = state.flagPole.y + flagPoleHeight - player.y
  const heightRatio = Math.max(0, Math.min(1, playerHeightOnPole / flagPoleHeight))
  const flagScore = Math.floor(100 + heightRatio * 4900)
  state.score += flagScore

  state.particles.push({
    id: `flag-score-${now}`,
    life: 120,
    maxLife: 120,
    type: 'coin',
    velocityX: 0,
    velocityY: -1,
    x: state.flagPole.x,
    y: player.y,
  })

  state.flagPole.flag.y = player.y
  state.pendingCompleteAt = now + 500
}

/**
 * Fallback goal when a level file omits `flagPole` coordinates.
 * @param {number} levelWidth - Level width in pixels
 * @param {number} tileSize - Pixels per tile
 * @returns {import('./mario-types').MarioGameState['flagPole']} Default pole and flag positions
 */
function defaultFlagPole(levelWidth: number, tileSize: number): MarioGameState['flagPole'] {
  const flagX = levelWidth - 5 * tileSize
  const flagY = 3 * tileSize
  return {
    flag: { height: 20, width: 30, x: flagX, y: flagY },
    height: 250,
    reached: false,
    width: 10,
    x: flagX,
    y: flagY,
  }
}

/**
 * Resize the player hitbox to match `powerUp` (small vs big/fire) and keep feet planted.
 * @param {import('./mario-types').Player} player - Mutable player entity
 * @returns {void}
 */
function setPlayerSizeForPower(player: Player): void {
  const wasH = player.height
  if (player.powerUp === 'small') {
    player.height = SMALL_H
    player.width = PLAYER_W
  } else {
    player.height = BIG_H
    player.width = PLAYER_W
  }
  if (player.height < wasH) {
    player.y += wasH - player.height
  } else if (player.height > wasH) {
    player.y -= player.height - wasH
  }
}

/**
 * Pick up coins and items; apply power-up transitions and floating score particles.
 * @param {import('./mario-types').MarioGameState} state - Mutable game state
 * @param {import('./mario-types').Player} player - Player entity
 * @param {number} now - Timestamp for star duration and particle ids
 * @returns {void}
 */
function updateCollectibles(state: MarioGameState, player: Player, now: number): void {
  state.collectibles = state.collectibles.map((collectible) => {
    if (collectible.collected) return collectible

    if (!checkCollision(player, collectible)) return collectible

    const updatedCollectible = { ...collectible, collected: true }
    state.score += collectible.value

    switch (collectible.type) {
      case 'coin':
        state.coinsCollected++
        playMarioSound('coin')
        break
      case 'fireflower':
        if (player.powerUp === 'small') {
          player.powerUp = 'big'
          setPlayerSizeForPower(player)
        }
        player.powerUp = 'fire'
        playMarioSound('powerup')
        break
      case 'mushroom':
        if (player.powerUp === 'small') {
          player.powerUp = 'big'
          setPlayerSizeForPower(player)
          playMarioSound('powerup')
        }
        break
      case 'star':
        state.starPowerUntil = now + STAR_MS
        playMarioSound('powerup')
        break
      default:
        break
    }

    state.particles.push({
      id: `coin-particle-${now}`,
      life: 20,
      maxLife: 20,
      type: 'coin',
      velocityX: 0,
      velocityY: -2,
      x: collectible.x,
      y: collectible.y,
    })

    return updatedCollectible
  })
}

/**
 * Move grounded enemies, piranhas, stomp/star/fireball interactions, and cull dead foes.
 * @param {import('./mario-types').MarioGameState} state - Mutable game state
 * @param {import('./mario-types').Player} player - Player entity
 * @param {number} now - Used for damage invulnerability checks
 * @param {boolean} starActive - When true, contact defeats enemies without hurting Mario
 * @returns {import('./mario-types').Enemy[]} Enemies still alive after this tick
 */
function updateEnemies(state: MarioGameState, player: Player, now: number, starActive: boolean): Enemy[] {
  const starKills = starActive

  const updated = state.enemies
    .map((enemy) => {
      if (!enemy.alive) return enemy
      const updatedEnemy = { ...enemy }

      if (updatedEnemy.type === 'piranha') {
        const anchor = updatedEnemy.anchorY ?? updatedEnemy.y
        const phase = state.gameTime * 2.8
        updatedEnemy.y = anchor - 20 + Math.sin(phase) * 22
        if (checkCollision(player, updatedEnemy)) {
          if (starKills) {
            updatedEnemy.alive = false
            awardEnemyScore(
              state,
              SCORE_FIRE_OR_STAR_ENEMY,
              updatedEnemy.x + updatedEnemy.width / 2,
              updatedEnemy.y,
              now,
              'star-piranha',
            )
          } else if (now >= state.invulnerableUntil) {
            applyPlayerDamage(state, player, now)
          }
        }
        return updatedEnemy
      }

      updatedEnemy.velocityY += GRAVITY * 0.5
      updatedEnemy.x += updatedEnemy.velocityX
      updatedEnemy.y += updatedEnemy.velocityY

      let onGround = false
      for (const platform of state.platforms) {
        if (checkCollision(updatedEnemy, platform) && platform.solid) {
          if (updatedEnemy.velocityY > 0 && updatedEnemy.y < platform.y) {
            updatedEnemy.y = platform.y - updatedEnemy.height
            updatedEnemy.velocityY = 0
            onGround = true
          } else if (updatedEnemy.velocityX > 0 && updatedEnemy.x < platform.x) {
            updatedEnemy.x = platform.x - updatedEnemy.width
            updatedEnemy.velocityX *= -1
            updatedEnemy.direction = updatedEnemy.direction === 'left' ? 'right' : 'left'
          } else if (updatedEnemy.velocityX < 0 && updatedEnemy.x > platform.x) {
            updatedEnemy.x = platform.x + platform.width
            updatedEnemy.velocityX *= -1
            updatedEnemy.direction = updatedEnemy.direction === 'left' ? 'right' : 'left'
          }
        }
      }

      if (onGround) {
        const lookAheadDistance = updatedEnemy.width
        const lookAheadX =
          updatedEnemy.velocityX > 0
            ? updatedEnemy.x + updatedEnemy.width + lookAheadDistance
            : updatedEnemy.x - lookAheadDistance

        let foundPlatform = false
        for (const platform of state.platforms) {
          if (
            checkCollision({ height: 1, width: 1, x: lookAheadX, y: updatedEnemy.y + updatedEnemy.height }, platform) &&
            platform.solid
          ) {
            foundPlatform = true
            break
          }
        }

        if (!foundPlatform) {
          updatedEnemy.velocityX *= -1
          updatedEnemy.direction = updatedEnemy.direction === 'left' ? 'right' : 'left'
        }
      }

      if (updatedEnemy.x < 0) {
        updatedEnemy.x = 0
        updatedEnemy.velocityX *= -1
        updatedEnemy.direction = 'right'
      } else if (updatedEnemy.x > state.levelWidth - updatedEnemy.width) {
        updatedEnemy.x = state.levelWidth - updatedEnemy.width
        updatedEnemy.velocityX *= -1
        updatedEnemy.direction = 'left'
      }

      if (updatedEnemy.y > state.levelHeight) {
        updatedEnemy.alive = false
      }

      if (checkCollision(player, updatedEnemy)) {
        if (starKills) {
          updatedEnemy.alive = false
          awardEnemyScore(
            state,
            SCORE_FIRE_OR_STAR_ENEMY,
            updatedEnemy.x + updatedEnemy.width / 2,
            updatedEnemy.y,
            now,
            `star-${updatedEnemy.id}`,
          )
          state.particles.push({
            id: `particle-${now}`,
            life: 30,
            maxLife: 30,
            type: 'explosion',
            velocityX: (Math.random() - 0.5) * 4,
            velocityY: -2,
            x: updatedEnemy.x,
            y: updatedEnemy.y,
          })
        } else if (isStompFromAbove(player, updatedEnemy)) {
          updatedEnemy.alive = false
          player.velocityY = -JUMP_FORCE / 2
          awardEnemyScore(
            state,
            SCORE_STOMP_ENEMY,
            updatedEnemy.x + updatedEnemy.width / 2,
            updatedEnemy.y,
            now,
            `stomp-${updatedEnemy.id}`,
          )
          state.particles.push({
            id: `particle-${now}-stomp`,
            life: 30,
            maxLife: 30,
            type: 'explosion',
            velocityX: (Math.random() - 0.5) * 4,
            velocityY: -2,
            x: updatedEnemy.x,
            y: updatedEnemy.y,
          })
        } else if (now >= state.invulnerableUntil) {
          applyPlayerDamage(state, player, now)
        }
      }

      return updatedEnemy
    })
    .filter((enemy) => enemy.alive)

  return updated
}

/**
 * Integrate fireball motion, platform hits, and enemy kills for this tick.
 * @param {import('./mario-types').MarioGameState} state - Mutable game state (also mutates enemy alive flags)
 * @param {number} now - Tick time for score particle ids
 * @returns {import('./mario-types').Fireball[]} Projectiles that remain in play
 */
function updateFireballs(state: MarioGameState, now: number): Fireball[] {
  const next: Fireball[] = []
  for (const fb of state.fireballs) {
    const moved = {
      ...fb,
      velocityY: fb.velocityY + GRAVITY * 0.35,
      x: fb.x + fb.velocityX,
      y: fb.y + fb.velocityY,
    }

    if (moved.x < 0 || moved.x > state.levelWidth || moved.y > state.levelHeight) continue

    let hit = false
    for (const p of state.platforms) {
      if (p.solid && checkCollision(moved, p)) {
        hit = true
        break
      }
    }
    if (hit) continue

    for (const enemy of state.enemies) {
      if (!enemy.alive) continue
      if (checkCollision(moved, enemy)) {
        enemy.alive = false
        awardEnemyScore(
          state,
          SCORE_FIRE_OR_STAR_ENEMY,
          enemy.x + enemy.width / 2,
          enemy.y,
          now,
          `fb-${moved.id}-${enemy.id}`,
        )
        state.particles.push({
          id: `ex-${moved.id}`,
          life: 25,
          maxLife: 25,
          type: 'explosion',
          velocityX: (Math.random() - 0.5) * 4,
          velocityY: -2,
          x: enemy.x,
          y: enemy.y,
        })
        hit = true
        break
      }
    }
    if (!hit) next.push(moved)
  }
  return next
}
