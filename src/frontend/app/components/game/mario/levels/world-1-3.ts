import type { LevelData, LevelTile } from '../level-format'

/**
 * Castle 1-3: wide pit with a cloud bridge, stepping bricks, and a tougher enemy mix.
 * @returns {LevelData} Fresh level definition (new tile grids each call)
 */
export function createWorld1Dash3Level(): LevelData {
  const width = 62
  const height = 13
  const tileSize = 32
  const tiles: LevelTile[][] = []

  for (let row = 0; row < height; row++) {
    tiles[row] = []
    for (let col = 0; col < width; col++) {
      tiles[row][col] = {
        id: `w13-${row}-${col}`,
        type: 'air',
      }
    }
  }

  const pitRange: [number, number] = [26, 34]

  for (let col = 0; col < width; col++) {
    const inPit = col >= pitRange[0] && col <= pitRange[1]
    if (!inPit) {
      tiles[11][col] = {
        id: `w13-ground-${col}`,
        type: 'ground',
      }
    }
  }

  for (let col = pitRange[0]; col <= pitRange[1]; col++) {
    tiles[8][col] = {
      id: `w13-bridge-${col}`,
      type: 'cloud',
    }
  }

  for (let col = 8; col < 13; col++) {
    tiles[9][col] = {
      id: `w13-brick-lo-${col}`,
      properties: { breakable: true },
      type: 'brick',
    }
  }

  for (let col = 38; col < 42; col++) {
    tiles[8][col] = {
      id: `w13-brick-mid-${col}`,
      properties: { breakable: true },
      type: 'brick',
    }
  }

  for (let col = 45; col < 51; col++) {
    tiles[7][col] = {
      id: `w13-brick-hi-${col}`,
      properties: { breakable: true },
      type: 'brick',
    }
  }

  for (let col = 54; col < 58; col++) {
    tiles[6][col] = {
      id: `w13-cloud-end-${col}`,
      type: 'cloud',
    }
  }

  for (let row = 7; row < 11; row++) {
    tiles[row][4] = { id: `w13-pipe-l-${row}`, type: 'pipe' }
    tiles[row][5] = { id: `w13-pipe-r-${row}`, type: 'pipe' }
  }

  tiles[7][20] = { id: 'w13-c1', type: 'coin' }
  tiles[7][36] = { id: 'w13-c2', type: 'coin' }
  tiles[6][47] = { id: 'w13-c3', type: 'coin' }
  tiles[5][56] = { id: 'w13-c4', type: 'coin' }

  tiles[10][12] = { id: 'w13-g1', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
  tiles[10][18] = { id: 'w13-g2', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
  tiles[10][35] = { id: 'w13-k1', properties: { enemyType: 'koopa' }, type: 'enemy-spawn' }
  tiles[10][50] = { id: 'w13-k2', properties: { enemyType: 'koopa' }, type: 'enemy-spawn' }

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
    id: 'default-level-3',
    metadata: {
      author: 'System',
      description: 'Castle ramparts—bridge the chasm and climb to the flag',
      difficulty: 3,
      theme: 'castle',
      timeLimit: 320,
    },
    name: 'World 1-3',
    objects: {
      collectibles: [
        { id: 'w13-mushroom', type: 'mushroom', value: 1000, x: 10, y: 7 },
        { id: 'w13-flower', type: 'fireflower', value: 500, x: 48, y: 5 },
      ],
      enemies: [{ id: 'w13-piranha', type: 'piranha', x: 4, y: 7 }],
      spawners: [],
    },
    startPosition: { x: 1, y: 9 },
    tiles,
    version: '1.0.0',
  }
}
