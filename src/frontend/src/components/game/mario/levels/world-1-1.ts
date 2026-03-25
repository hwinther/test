import type { LevelData, LevelTile } from '../level-format'

/**
 * Overworld 1-1: ground course with pipes, bricks, and a few enemies.
 * @returns {LevelData} Fresh level definition (new tile grids each call)
 */
export function createWorld1Dash1Level(): LevelData {
  const width = 62
  const height = 13
  const tileSize = 32
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

  for (let col = 0; col < width; col++) {
    tiles[11][col] = {
      id: `ground-${col}`,
      type: 'ground',
    }
  }

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

  tiles[8][7] = { id: 'coin-1', type: 'coin' }
  tiles[6][13] = { id: 'coin-2', type: 'coin' }
  tiles[5][19] = { id: 'coin-3', type: 'coin' }

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
      timeLimit: 400,
    },
    name: 'World 1-1',
    objects: {
      collectibles: [
        { id: 'mushroom-1', type: 'mushroom', value: 1000, x: 26, y: 3 },
        { id: 'flower-1', type: 'fireflower', value: 500, x: 28, y: 3 },
      ],
      enemies: [{ id: 'piranha-1', type: 'piranha', x: 31, y: 7 }],
      spawners: [],
    },
    startPosition: { x: 1, y: 9 },
    tiles,
    version: '1.0.0',
  }
}
