export interface LevelData {
  dimensions: {
    height: number // in tiles
    tileSize: number // pixels per tile
    width: number // in tiles
  }
  flagPole?: {
    x: number
    y: number
  }
  id: string
  metadata: {
    author: string
    description: string
    difficulty: 1 | 2 | 3 | 4 | 5
    theme: 'castle' | 'overworld' | 'underground' | 'underwater'
    timeLimit?: number
  }
  name: string
  objects: {
    collectibles: Array<{
      id: string
      properties?: Record<string, any>
      type: string
      value: number
      x: number
      y: number
    }>
    enemies: Array<{
      id: string
      properties?: Record<string, any>
      type: string
      x: number // in tiles
      y: number
    }>
    spawners: Array<{
      id: string
      properties?: Record<string, any>
      type: 'enemy' | 'item' | 'player'
      x: number
      y: number
    }>
  }
  startPosition: {
    x: number // in tiles
    y: number
  }
  tiles: LevelTile[][] // 2D grid [row][col]
  version: string
}

export interface LevelTile {
  id: string
  properties?: {
    [key: string]: any
    breakable?: boolean
    collectibleType?: 'coin' | 'mushroom'
    enemyType?: 'goomba' | 'koopa'
    pipeHeight?: number
  }
  type: 'air' | 'brick' | 'cloud' | 'coin' | 'enemy-spawn' | 'flag-pole' | 'ground' | 'pipe' | 'player-spawn'
}

export interface World {
  id: string
  levels: string[] // Level IDs in order
  name: string
  unlockRequirements?: {
    [levelId: string]: {
      maxTime?: number
      minScore?: number
      previousLevels: string[]
    }
  }
}
