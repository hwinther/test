/* eslint-disable sonarjs/pseudo-random */
import type { LevelData } from './level-format'
import type {
  Enemy,
  Fireball,
  GameInputSnapshot,
  LevelTheme,
  MarioGameState,
  Platform,
  Player,
  SpriteTheme,
} from './mario-types'

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
const JUMP_RELEASE_SPEED = -4.5
const MAX_FALL_SPEED = 16
const GROUND_ACCELERATION = 0.8
const AIR_ACCELERATION = 0.5
const GROUND_DECELERATION = 0.85
const AIR_DECELERATION = 0.25
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
 * @returns {import('./mario-types').MarioGameState} New state for the next frame
 */
export function advanceGameState(prev: MarioGameState, input: GameInputSnapshot): MarioGameState {
  if (prev.gameStatus !== 'playing') return prev

  const gameTime = prev.gameTime + FIXED_DT
  const now = gameTime * 1000
  if (prev.pendingCompleteAt !== null) {
    if (now >= prev.pendingCompleteAt) {
      return { ...prev, gameStatus: 'complete', gameTime, pendingCompleteAt: null }
    }
    return { ...prev, gameTime }
  }

  const newState: MarioGameState = {
    ...prev,
    enemies: prev.enemies.map((e) => ({ ...e })),
    fireballs: [...prev.fireballs],
    gameTime,
    flagPole: {
      ...prev.flagPole,
      flag: { ...prev.flagPole.flag },
    },
    particles: [...prev.particles],
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

  setPlayerSizeForPower(player, newState.platforms)
  updatePlayerMotion(newState, input, now)
  newState.furthestX = Math.max(prev.furthestX, player.x)

  if (player.y > newState.levelHeight) {
    loseLife(newState, now)
    return newState
  }

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

  newState.enemies = updateEnemies(newState, player, now, starActive, prev.player.y + prev.player.height)

  if (player.lives !== prev.player.lives) return newState

  updateCollectibles(newState, player, now)

  newState.particles = newState.particles
    .map((particle) => ({
      ...particle,
      life: particle.life - 1,
      x: particle.x + particle.velocityX,
      y: particle.y + particle.velocityY,
    }))
    .filter((particle) => particle.life > 0)

  if (newState.proofroom) {
    updateProofroom(newState)
  } else {
    checkFlagPole(newState, player, now)
  }

  if (newState.timeRemaining !== null && newState.pendingCompleteAt === null) {
    newState.timeRemaining = Math.max(0, newState.timeRemaining - FIXED_DT)
    if (newState.timeRemaining <= 0) loseLife(newState, now)
  }

  newState.cameraX = playerCameraX(newState)
  return newState
}

/**
 * Collect the document corrections and enter the publication course through the approval exit.
 * @param {MarioGameState} state - Mutable game state for this tick
 */
function updateProofroom(state: MarioGameState): void {
  const room = state.proofroom
  if (!room) return

  const marks = room.marks.map((mark) => {
    if (mark.collected || !checkCollision(state.player, mark)) return mark
    playMarioSound('coin')
    return { ...mark, collected: true }
  })

  if (marks.every(({ collected }) => collected) && checkCollision(state.player, room.exit)) {
    playMarioSound('flag')
    const { spawnPosition } = room.course
    Object.assign(state, room.course)
    state.furthestX = spawnPosition.x
    Object.assign(state.player, spawnPosition, { coyoteFrames: 0, velocityX: 0, velocityY: 0 })
    state.player.onGround = false
    state.player.isJumping = false
    state.jumpBufferFrames = 0
    delete state.proofroom
    return
  }

  state.proofroom = { ...room, marks }
}

/**
 * Apply acceleration, buffered jumping and axis-separated collision for one player tick.
 * @param {import('./mario-types').MarioGameState} state - Mutable game state
 * @param {import('./mario-types').GameInputSnapshot} input - Input held this tick
 * @param {number} now - Active simulation time in milliseconds
 */
function updatePlayerMotion(state: MarioGameState, input: GameInputSnapshot, now: number): void {
  const player = state.player
  if (player.onGround) player.coyoteFrames = COYOTE_MAX

  const direction = Number(input.right) - Number(input.left)
  const maxSpeed = input.run ? PLAYER_SPEED * RUN_MULTIPLIER : PLAYER_SPEED
  const targetSpeed = direction * maxSpeed
  const acceleration = player.onGround ? GROUND_ACCELERATION : AIR_ACCELERATION
  const deceleration = player.onGround ? GROUND_DECELERATION : AIR_DECELERATION
  const step = direction === 0 ? deceleration : acceleration
  const speedDifference = targetSpeed - player.velocityX
  player.velocityX += Math.max(-step, Math.min(step, speedDifference))
  player.isRunning = input.run && direction !== 0
  if (direction !== 0) player.facing = direction > 0 ? 'right' : 'left'

  if (state.jumpBufferFrames > 0 && (player.onGround || player.coyoteFrames > 0)) {
    player.velocityY = -JUMP_FORCE
    player.isJumping = true
    player.onGround = false
    player.coyoteFrames = 0
    state.jumpBufferFrames = 0
    playMarioSound('jump')
  }

  if (player.isJumping && !input.jumpHeld) {
    player.velocityY = Math.max(player.velocityY, JUMP_RELEASE_SPEED)
  }
  player.velocityY = Math.min(MAX_FALL_SPEED, player.velocityY + GRAVITY)

  const solidPlatforms = state.platforms.filter((platform) => platform.solid)
  const horizontalHit = sweptPlatform(player, solidPlatforms, 'x', player.velocityX)
  if (horizontalHit) {
    player.x = player.velocityX > 0 ? horizontalHit.x - player.width : horizontalHit.x + horizontalHit.width
    player.velocityX = 0
  } else {
    const nextX = player.x + player.velocityX
    player.x = Math.max(0, Math.min(nextX, state.levelWidth - player.width))
    if (player.x !== nextX) player.velocityX = 0
  }

  const verticalHit = sweptPlatform(player, solidPlatforms, 'y', player.velocityY)
  player.onGround = Boolean(verticalHit && player.velocityY > 0)
  if (verticalHit) {
    if (player.onGround) {
      player.y = verticalHit.y - player.height
      player.isJumping = false
    } else {
      player.y = verticalHit.y + verticalHit.height
      if (verticalHit.breakable && player.powerUp !== 'small') breakBrick(state, verticalHit, now)
    }
    player.velocityY = 0
  } else {
    player.y += player.velocityY
  }

  if (!player.onGround) player.coyoteFrames = Math.max(0, player.coyoteFrames - 1)
}

/**
 * Find the first solid edge crossed by an axis-aligned movement.
 * @param {import('./mario-types').Player | import('./mario-types').Enemy} body - Entity before moving on this axis
 * @param {import('./mario-types').Platform[]} platforms - Solid platforms
 * @param {'x' | 'y'} axis - Movement axis
 * @param {number} velocity - Signed displacement this tick
 * @returns {import('./mario-types').Platform | undefined} Nearest platform hit
 */
function sweptPlatform(
  body: Enemy | Player,
  platforms: Platform[],
  axis: 'x' | 'y',
  velocity: number,
): Platform | undefined {
  if (velocity === 0) return undefined
  const crossAxis = axis === 'x' ? 'y' : 'x'
  const size = axis === 'x' ? 'width' : 'height'
  const crossSize = axis === 'x' ? 'height' : 'width'
  const leadingEdge = body[axis] + (velocity > 0 ? body[size] : 0)
  const direction = Math.sign(velocity)
  let nearest: Platform | undefined
  let distance = Math.abs(velocity)

  for (const platform of platforms) {
    if (body[crossAxis] >= platform[crossAxis] + platform[crossSize]) continue
    if (body[crossAxis] + body[crossSize] <= platform[crossAxis]) continue

    const edge = platform[axis] + (velocity > 0 ? 0 : platform[size])
    const gap = (edge - leadingEdge) * direction
    if (gap >= 0 && gap <= distance) {
      distance = gap
      nearest = platform
    }
  }
  return nearest
}

/**
 * Remove a brick hit from below and award points and particles.
 * @param {import('./mario-types').MarioGameState} state - Mutable game state
 * @param {import('./mario-types').Platform} brick - Impacted brick
 * @param {number} now - Active simulation time in milliseconds
 */
function breakBrick(state: MarioGameState, brick: Platform, now: number): void {
  state.platforms = state.platforms.filter((platform) => platform !== brick)
  state.score += 50
  playMarioSound('stomp')
  for (let i = 0; i < 6; i++) {
    state.particles.push({
      id: `brick-${brick.id}-${i}-${now}`,
      life: 25,
      maxLife: 25,
      type: 'brick',
      velocityX: (Math.random() - 0.5) * 5,
      velocityY: -2 - Math.random() * 2,
      x: brick.x + Math.random() * brick.width,
      y: brick.y + brick.height / 2,
    })
  }
}

/**
 * Scroll to keep the player near the center where the level bounds allow it.
 * @param {import('./mario-types').MarioGameState} state - Current game state
 * @returns {number} Camera position in level pixels
 */
function playerCameraX(state: MarioGameState): number {
  return Math.max(0, Math.min(state.player.x - MARIO_CANVAS_WIDTH / 2, state.levelWidth - MARIO_CANVAS_WIDTH))
}

/**
 * Deduct a life and respawn the player at the level's configured start if lives remain.
 * @param {import('./mario-types').MarioGameState} state - Mutable game state
 * @param {number} now - Active simulation time in milliseconds
 */
function loseLife(state: MarioGameState, now: number): void {
  const player = state.player
  player.lives--
  playMarioSound('damage')
  if (player.lives <= 0) {
    state.gameStatus = 'gameOver'
    return
  }

  player.powerUp = 'small'
  setPlayerSizeForPower(player)
  player.x = state.spawnPosition.x
  player.y = state.spawnPosition.y
  player.velocityX = 0
  player.velocityY = 0
  player.facing = 'right'
  player.onGround = false
  player.isJumping = false
  player.isRunning = false
  player.coyoteFrames = 0
  player.invulnerable = true
  state.invulnerableUntil = now + INVULN_MS
  state.starPowerUntil = 0
  state.jumpBufferFrames = 0
  state.fireballs = []
  state.fireCooldownFrames = 0
  state.timeRemaining = state.timeLimitMax
  state.cameraX = playerCameraX(state)
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
    furthestX: player.x,
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
    spawnPosition: { x: player.x, y: player.y },
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
 * @param {number} now - Active simulation time in milliseconds
 * @returns {void}
 */
function applyPlayerDamage(state: MarioGameState, player: Player, now: number): void {
  if (now < state.invulnerableUntil) return

  if (player.powerUp === 'fire') {
    player.powerUp = 'big'
    setPlayerSizeForPower(player)
    player.invulnerable = true
    state.invulnerableUntil = now + INVULN_MS
    playMarioSound('damage')
  } else if (player.powerUp === 'big') {
    player.powerUp = 'small'
    setPlayerSizeForPower(player)
    player.invulnerable = true
    state.invulnerableUntil = now + INVULN_MS
    playMarioSound('damage')
  } else {
    loseLife(state, now)
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
 * @param {import('./mario-types').Platform[]} [platforms] - Obstacles that can delay growth until there is room
 */
function setPlayerSizeForPower(player: Player, platforms?: Platform[]): void {
  const height = player.powerUp === 'small' ? SMALL_H : BIG_H
  if (player.height === height && player.width === PLAYER_W) return

  const y = player.y + player.height - height
  const bounds = { height, width: PLAYER_W, x: player.x, y }
  if (height > player.height && platforms?.some((platform) => platform.solid && checkCollision(bounds, platform))) {
    return
  }
  Object.assign(player, bounds)
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
          setPlayerSizeForPower(player, state.platforms)
        }
        player.powerUp = 'fire'
        playMarioSound('powerup')
        break
      case 'mushroom':
        if (player.powerUp === 'small') {
          player.powerUp = 'big'
          setPlayerSizeForPower(player, state.platforms)
          playMarioSound('powerup')
        }
        break
      case 'star':
        state.starPowerUntil = now + STAR_MS
        player.invulnerable = true
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
 * @param {number} previousFeet - Player foot position before moving
 * @returns {import('./mario-types').Enemy[]} Enemies still alive after this tick
 */
function updateEnemies(
  state: MarioGameState,
  player: Player,
  now: number,
  starActive: boolean,
  previousFeet: number,
): Enemy[] {
  const solidPlatforms = state.platforms.filter((platform) => platform.solid)

  const updated = state.enemies
    .map((enemy) => {
      if (!enemy.alive || state.gameStatus === 'gameOver') return enemy
      const updatedEnemy = { ...enemy }

      if (updatedEnemy.type === 'piranha') {
        const anchor = updatedEnemy.anchorY ?? updatedEnemy.y
        const phase = state.gameTime * 2.8
        updatedEnemy.y = anchor - 20 + Math.sin(phase) * 22
        if (checkCollision(player, updatedEnemy)) {
          if (starActive) {
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

      const wall = sweptPlatform(updatedEnemy, solidPlatforms, 'x', updatedEnemy.velocityX)
      if (wall) {
        updatedEnemy.x = updatedEnemy.velocityX > 0 ? wall.x - updatedEnemy.width : wall.x + wall.width
        updatedEnemy.velocityX *= -1
      } else {
        updatedEnemy.x += updatedEnemy.velocityX
      }

      updatedEnemy.velocityY = Math.min(MAX_FALL_SPEED, updatedEnemy.velocityY + GRAVITY * 0.5)
      const floor = sweptPlatform(updatedEnemy, solidPlatforms, 'y', updatedEnemy.velocityY)
      if (floor) {
        updatedEnemy.y = floor.y - updatedEnemy.height
        updatedEnemy.velocityY = 0

        const edgeX = updatedEnemy.velocityX > 0 ? updatedEnemy.x + updatedEnemy.width : updatedEnemy.x - 1
        const nextFoot = { height: 1, width: 1, x: edgeX, y: updatedEnemy.y + updatedEnemy.height }
        if (!wall && !solidPlatforms.some((platform) => checkCollision(nextFoot, platform))) {
          updatedEnemy.velocityX *= -1
        }
      } else {
        updatedEnemy.y += updatedEnemy.velocityY
      }

      if (updatedEnemy.x < 0) {
        updatedEnemy.x = 0
        updatedEnemy.velocityX *= -1
      } else if (updatedEnemy.x > state.levelWidth - updatedEnemy.width) {
        updatedEnemy.x = state.levelWidth - updatedEnemy.width
        updatedEnemy.velocityX *= -1
      }

      updatedEnemy.direction = updatedEnemy.velocityX > 0 ? 'right' : 'left'

      if (updatedEnemy.y > state.levelHeight) {
        updatedEnemy.alive = false
        return updatedEnemy
      }

      if (checkCollision(player, updatedEnemy)) {
        if (starActive) {
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
        } else if (player.velocityY >= 0 && previousFeet <= enemy.y && player.y + player.height >= updatedEnemy.y) {
          updatedEnemy.alive = false
          player.y = updatedEnemy.y - player.height
          player.velocityY = -JUMP_FORCE / 2
          player.isJumping = false
          player.onGround = false
          player.coyoteFrames = 0
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
