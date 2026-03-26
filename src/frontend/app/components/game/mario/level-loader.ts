import type { LevelData, LevelTile } from './level-format'
import {
  createWorld1Dash1Level,
  createWorld1Dash2Level as buildWorld1Dash2Level,
  createWorld1Dash3Level as buildWorld1Dash3Level,
} from './levels'
import type { Collectible, Enemy, FlagPole, LevelTheme, MarioGameState, Platform } from './mario-types'

type EnemySpawnKind = 'goomba' | 'koopa' | 'piranha'

export class LevelLoader {
  /**
   * Built-in overworld course (implemented in `./levels/world-1-1.ts`).
   * @returns {LevelData} Copy from the 1-1 level builder
   */
  static createDefaultLevel(): LevelData {
    return createWorld1Dash1Level()
  }

  /**
   * Default three-level campaign: 1-1, 1-2, then castle 1-3.
   * @returns {LevelData[]} Ordered levels for `MarioGame` `levelSequence`
   */
  static createDefaultLevelSequence(): LevelData[] {
    return [createWorld1Dash1Level(), buildWorld1Dash2Level(), buildWorld1Dash3Level()]
  }

  static createEmptyLevel(width: number, height: number, tileSize: number = 32): LevelData {
    const tiles: LevelTile[][] = []

    for (let row = 0; row < height; row++) {
      tiles[row] = []
      for (let col = 0; col < width; col++) {
        tiles[row][col] = {
          id: `tile-${row}-${col}`,
          type: 'air',
        }
      }
    }

    return {
      dimensions: {
        height,
        tileSize,
        width,
      },
      id: `level-${Date.now()}`,
      metadata: {
        author: 'Player',
        description: 'A custom level',
        difficulty: 1,
        theme: 'overworld',
      },
      name: 'New Level',
      objects: {
        collectibles: [],
        enemies: [],
        spawners: [],
      },
      startPosition: { x: 1, y: height - 3 },
      tiles,
      version: '1.0.0',
    }
  }

  /**
   * Underground 1-2 (implemented in `./levels/world-1-2.ts`).
   * @returns {LevelData} Copy from the 1-2 level builder
   */
  static createWorld1Dash2Level(): LevelData {
    return buildWorld1Dash2Level()
  }

  /**
   * Castle 1-3 (implemented in `./levels/world-1-3.ts`).
   * @returns {LevelData} Copy from the 1-3 level builder
   */
  static createWorld1Dash3Level(): LevelData {
    return buildWorld1Dash3Level()
  }

  static parseLevel(levelData: LevelData): Partial<MarioGameState> {
    const platforms: Platform[] = []
    const enemies: Enemy[] = []
    const collectibles: Collectible[] = []

    const { tileSize } = levelData.dimensions

    // Parse tile grid into game objects
    for (let row = 0; row < levelData.tiles.length; row++) {
      for (let col = 0; col < levelData.tiles[row].length; col++) {
        const tile = levelData.tiles[row][col]
        const x = col * tileSize
        const y = row * tileSize

        switch (tile.type) {
          case 'brick':
          case 'cloud':
          case 'ground':
          case 'pipe':
            platforms.push({
              breakable: tile.properties?.breakable ?? tile.type === 'brick',
              height: tile.properties?.pipeHeight ? tile.properties.pipeHeight * tileSize : tileSize,
              id: `${tile.type}-${row}-${col}`,
              solid: true,
              type: tile.type,
              width: tileSize,
              x,
              y,
            })
            break

          case 'coin':
            collectibles.push({
              collected: false,
              height: tileSize / 2,
              id: `coin-${row}-${col}`,
              type: 'coin',
              value: 100,
              width: tileSize / 2,
              x: x + tileSize / 4,
              y: y + tileSize / 4,
            })
            break

          case 'enemy-spawn':
            if (tile.properties?.enemyType) {
              const et = tile.properties.enemyType as EnemySpawnKind
              const isPiranha = et === 'piranha'
              const m = LevelLoader.metricsForSpawnKind(et)
              enemies.push({
                alive: true,
                anchorY: isPiranha ? y + tileSize * 0.5 : undefined,
                direction: 'left',
                height: m.height,
                id: `enemy-${row}-${col}`,
                type: et,
                velocityX: m.velocityX,
                velocityY: 0,
                width: m.width,
                x,
                y,
              })
            }
            break
        }
      }
    }

    // Parse additional objects
    for (const enemyData of levelData.objects.enemies) {
      const kind = enemyData.type as EnemySpawnKind
      const isPiranha = kind === 'piranha'
      const m = LevelLoader.metricsForSpawnKind(kind)
      const px = enemyData.x * tileSize
      const py = enemyData.y * tileSize
      enemies.push({
        alive: true,
        anchorY: isPiranha ? py + tileSize * 0.5 : undefined,
        direction: 'left',
        height: m.height,
        id: enemyData.id,
        type: kind,
        velocityX: m.velocityX,
        velocityY: 0,
        width: m.width,
        x: px,
        y: py,
      })
    }

    for (const collectibleData of levelData.objects.collectibles) {
      const large =
        collectibleData.type === 'mushroom' || collectibleData.type === 'fireflower' || collectibleData.type === 'star'
      collectibles.push({
        collected: false,
        height: large ? 24 : 16,
        id: collectibleData.id,
        type: collectibleData.type as 'coin' | 'fireflower' | 'mushroom' | 'star',
        value: collectibleData.value,
        width: large ? 24 : 16,
        x: collectibleData.x * tileSize,
        y: collectibleData.y * tileSize,
      })
    }

    // Create flag pole
    let flagPole: FlagPole | undefined
    if (levelData.flagPole) {
      const flagX = levelData.flagPole.x * tileSize
      const flagY = levelData.flagPole.y * tileSize
      flagPole = {
        flag: {
          height: 20,
          width: 30,
          x: flagX,
          y: flagY,
        },
        height: 250,
        reached: false,
        width: 10,
        x: flagX,
        y: flagY,
      }
    }

    const theme = (levelData.metadata.theme || 'overworld') as LevelTheme

    return {
      collectibles,
      enemies,
      flagPole,
      levelHeight: levelData.dimensions.height * tileSize,
      levelTheme: theme,
      levelWidth: levelData.dimensions.width * tileSize,
      platforms,
      player: {
        coyoteFrames: 0,
        facing: 'right',
        height: 32,
        invulnerable: false,
        isJumping: false,
        isRunning: false,
        lives: 3,
        onGround: false,
        powerUp: 'small',
        velocityX: 0,
        velocityY: 0,
        width: 32,
        x: levelData.startPosition.x * tileSize,
        y: levelData.startPosition.y * tileSize,
      },
    }
  }

  /**
   * Hitbox size and horizontal speed for an enemy spawned from tiles or `objects.enemies`.
   * @param {'goomba' | 'koopa' | 'piranha'} kind - Enemy variant from level JSON
   * @returns {object} width, height, and initial velocityX
   */
  private static metricsForSpawnKind(kind: EnemySpawnKind): { height: number; velocityX: number; width: number } {
    switch (kind) {
      case 'koopa':
        return { height: 32, velocityX: -2.5, width: 28 }
      case 'piranha':
        return { height: 28, velocityX: 0, width: 24 }
      default:
        return { height: 24, velocityX: -2, width: 24 }
    }
  }
}
