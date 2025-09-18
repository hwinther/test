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

export interface KeyState {
  down: boolean
  jump: boolean
  left: boolean
  right: boolean
  run: boolean
  up: boolean
}

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
  collectibles: Collectible[]
  enemies: Enemy[]
  flagPole: FlagPole
  gameStatus: 'complete' | 'gameOver' | 'paused' | 'playing'
  gameTime: number
  level: number
  levelHeight: number
  levelWidth: number
  particles: Particle[]
  platforms: Platform[]
  player: Player
  score: number
}

export interface Particle {
  id: string
  life: number
  maxLife: number
  type: 'brick' | 'coin' | 'explosion'
  velocityX: number
  velocityY: number
  x: number
  y: number
}

export interface Platform {
  breakable: boolean
  height: number
  solid: boolean
  type: 'brick' | 'cloud' | 'ground' | 'pipe'
  width: number
  x: number
  y: number
}

export interface Player {
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
