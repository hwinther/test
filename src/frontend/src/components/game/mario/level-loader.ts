import type { LevelData, LevelTile } from './level-format'
import type { Collectible, Enemy, FlagPole, MarioGameState, Platform } from './mario-types'

export class LevelLoader {
  static createDefaultLevel(): LevelData {
    const width = 62
    const height = 13
    const tileSize = 32
    const tiles: LevelTile[][] = []

    // Initialize with air tiles
    for (let row = 0; row < height; row++) {
      tiles[row] = []
      for (let col = 0; col < width; col++) {
        tiles[row][col] = {
          id: `tile-${row}-${col}`,
          type: 'air',
        }
      }
    }

    // Add ground
    for (let col = 0; col < width; col++) {
      tiles[11][col] = {
        id: `ground-${col}`,
        type: 'ground',
      }
    }

    // Add platforms
    for (let col = 6; col < 10; col++) {
      tiles[9][col] = {
        id: `brick-${col}`,
        properties: { breakable: true },
        type: 'brick',
      }
    }

    for (let col = 12; col < 16; col++) {
      tiles[7][col] = {
        id: `brick-${col}`,
        properties: { breakable: true },
        type: 'brick',
      }
    }

    for (let col = 18; col < 22; col++) {
      tiles[6][col] = {
        id: `cloud-${col}`,
        type: 'cloud',
      }
    }

    for (let col = 25; col < 29; col++) {
      tiles[4][col] = {
        id: `cloud-${col}`,
        type: 'cloud',
      }
    }

    // Add pipes
    for (let row = 7; row < 11; row++) {
      tiles[row][31] = {
        id: `pipe-31-${row}`,
        type: 'pipe',
      }
      tiles[row][32] = {
        id: `pipe-32-${row}`,
        type: 'pipe',
      }
    }

    for (let row = 6; row < 11; row++) {
      tiles[row][37] = {
        id: `pipe-37-${row}`,
        type: 'pipe',
      }
      tiles[row][38] = {
        id: `pipe-38-${row}`,
        type: 'pipe',
      }
    }

    // Add coins
    tiles[8][7] = { id: 'coin-1', type: 'coin' }
    tiles[6][13] = { id: 'coin-2', type: 'coin' }
    tiles[5][19] = { id: 'coin-3', type: 'coin' }

    // Add enemies
    tiles[10][9] = { id: 'goomba-1', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
    tiles[10][15] = { id: 'goomba-2', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
    tiles[10][22] = { id: 'koopa-1', properties: { enemyType: 'koopa' }, type: 'enemy-spawn' }

    return {
      dimensions: {
        height,
        tileSize,
        width,
      },
      flagPole: {
        x: 58,
        y: 3,
      },
      id: 'default-level-1',
      metadata: {
        author: 'System',
        description: 'The classic first level',
        difficulty: 1,
        theme: 'overworld',
      },
      name: 'World 1-1',
      objects: {
        collectibles: [{ id: 'mushroom-1', type: 'mushroom', value: 1000, x: 26, y: 3 }],
        enemies: [],
        spawners: [],
      },
      startPosition: { x: 1, y: 9 },
      tiles,
      version: '1.0.0',
    }
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
              enemies.push({
                alive: true,
                direction: 'left',
                height: tile.properties.enemyType === 'koopa' ? 32 : 24,
                id: `enemy-${row}-${col}`,
                type: tile.properties.enemyType,
                velocityX: tile.properties.enemyType === 'koopa' ? -2.5 : -2,
                velocityY: 0,
                width: tile.properties.enemyType === 'koopa' ? 28 : 24,
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
      enemies.push({
        alive: true,
        direction: 'left',
        height: enemyData.type === 'koopa' ? 32 : 24,
        id: enemyData.id,
        type: enemyData.type as 'goomba' | 'koopa' | 'piranha',
        velocityX: enemyData.type === 'koopa' ? -2.5 : -2,
        velocityY: 0,
        width: enemyData.type === 'koopa' ? 28 : 24,
        x: enemyData.x * tileSize,
        y: enemyData.y * tileSize,
      })
    }

    for (const collectibleData of levelData.objects.collectibles) {
      collectibles.push({
        collected: false,
        height: collectibleData.type === 'mushroom' ? 24 : 16,
        id: collectibleData.id,
        type: collectibleData.type as 'coin' | 'fireflower' | 'mushroom' | 'star',
        value: collectibleData.value,
        width: collectibleData.type === 'mushroom' ? 24 : 16,
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

    return {
      collectibles,
      enemies,
      flagPole,
      levelHeight: levelData.dimensions.height * tileSize,
      levelWidth: levelData.dimensions.width * tileSize,
      platforms,
      player: {
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
}
