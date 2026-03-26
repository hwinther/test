export interface Collectible {
  collected: boolean
  height: number
  id: string
  type: 'coin' | 'fireflower' | 'mushroom' | 'star'
  value: number
  width: number
  x: number
  y: number
}

export interface Enemy {
  alive: boolean
  anchorY?: number
  direction: 'left' | 'right'
  height: number
  id: string
  type: 'goomba' | 'koopa' | 'piranha'
  velocityX: number
  velocityY: number
  width: number
  x: number
  y: number
}

export interface Fireball {
  height: number
  id: string
  velocityX: number
  velocityY: number
  width: number
  x: number
  y: number
}

export interface FlagPole {
  flag: {
    height: number
    width: number
    x: number
    y: number
  }
  height: number
  reached: boolean
  width: number
  x: number
  y: number
}

export interface GameInputSnapshot {
  down: boolean
  firePressed: boolean
  jumpHeld: boolean
  jumpPressed: boolean
  left: boolean
  right: boolean
  run: boolean
}

/** Writable ref cell (same shape as `useRef().current` updates). */
export type GameRef<T> = { current: T }

export interface KeyState {
  down: boolean
  jump: boolean
  left: boolean
  right: boolean
  run: boolean
  up: boolean
}

export type LevelTheme = 'castle' | 'overworld' | 'underground' | 'underwater'

export type SpriteTheme = 'botvar' | 'classic'

export interface MarioGameResult {
  coinsCollected: number
  completed: boolean
  enemiesDefeated: number
  level: number
  score: number
  timeElapsed: number
}

export interface MarioGameState {
  cameraX: number
  coinsCollected: number
  collectibles: Collectible[]
  enemies: Enemy[]
  enemiesDefeated: number
  fireballs: Fireball[]
  fireCooldownFrames: number
  flagPole: FlagPole
  gameStatus: 'complete' | 'gameOver' | 'paused' | 'playing'
  gameTime: number
  invulnerableUntil: number
  jumpBufferFrames: number
  level: number
  levelHeight: number
  levelTheme: LevelTheme
  levelWidth: number
  particles: Particle[]
  pendingCompleteAt: null | number
  platforms: Platform[]
  player: Player
  score: number
  spriteTheme: SpriteTheme
  starPowerUntil: number
  timeLimitMax: null | number
  timeRemaining: null | number
}

export interface Particle {
  id: string
  life: number
  maxLife: number
  type: 'brick' | 'coin' | 'explosion' | 'score'
  /** Pop-up points when `type` is `'score'` */
  value?: number
  velocityX: number
  velocityY: number
  x: number
  y: number
}

export interface Platform {
  breakable: boolean
  height: number
  id: string
  solid: boolean
  type: 'brick' | 'cloud' | 'ground' | 'pipe'
  width: number
  x: number
  y: number
}

export interface Player {
  coyoteFrames: number
  facing: 'left' | 'right'
  height: number
  invulnerable: boolean
  isJumping: boolean
  isRunning: boolean
  lives: number
  onGround: boolean
  powerUp: 'big' | 'fire' | 'small'
  velocityX: number
  velocityY: number
  width: number
  x: number
  y: number
}
