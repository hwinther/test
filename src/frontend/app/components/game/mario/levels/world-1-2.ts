import type { LevelData, LevelTile } from '../level-format'

/**
 * Underground 1-2: pits, brick platforming, pipe piranha, and a star.
 * @returns {LevelData} Fresh level definition (new tile grids each call)
 */
export function createWorld1Dash2Level(): LevelData {
  const width = 62
  const height = 13
  const tileSize = 32
  const tiles: LevelTile[][] = []

  for (let row = 0; row < height; row++) {
    tiles[row] = []
    for (let col = 0; col < width; col++) {
      tiles[row][col] = {
        id: `w12-${row}-${col}`,
        type: 'air',
      }
    }
  }

  const pitRanges: Array<[number, number]> = [
    [11, 14],
    [22, 25],
    [34, 37],
    [48, 51],
  ]

  for (let col = 0; col < width; col++) {
    const inPit = pitRanges.some(([a, b]) => col >= a && col <= b)
    if (!inPit) {
      tiles[11][col] = {
        id: `w12-ground-${col}`,
        type: 'ground',
      }
    }
  }

  for (let col = 16; col < 20; col++) {
    tiles[9][col] = {
      id: `w12-brick-a-${col}`,
      properties: { breakable: true },
      type: 'brick',
    }
  }

  for (let col = 27; col < 32; col++) {
    tiles[8][col] = {
      id: `w12-brick-b-${col}`,
      properties: { breakable: true },
      type: 'brick',
    }
  }

  for (let col = 40; col < 45; col++) {
    tiles[7][col] = {
      id: `w12-brick-c-${col}`,
      properties: { breakable: true },
      type: 'brick',
    }
  }

  for (let col = 52; col < 56; col++) {
    tiles[9][col] = {
      id: `w12-cloud-${col}`,
      type: 'cloud',
    }
  }

  for (let row = 7; row < 11; row++) {
    tiles[row][18] = { id: `w12-pipe-l-${row}`, type: 'pipe' }
    tiles[row][19] = { id: `w12-pipe-r-${row}`, type: 'pipe' }
  }

  tiles[8][5] = { id: 'w12-coin-1', type: 'coin' }
  tiles[8][17] = { id: 'w12-coin-2', type: 'coin' }
  tiles[7][29] = { id: 'w12-coin-3', type: 'coin' }
  tiles[6][42] = { id: 'w12-coin-4', type: 'coin' }

  tiles[10][8] = { id: 'w12-g1', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
  tiles[10][30] = { id: 'w12-g2', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
  tiles[10][44] = { id: 'w12-k1', properties: { enemyType: 'koopa' }, type: 'enemy-spawn' }

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
    id: 'default-level-2',
    metadata: {
      author: 'System',
      description: 'Underground caverns and bottomless pits',
      difficulty: 2,
      theme: 'underground',
      timeLimit: 360,
    },
    name: 'World 1-2',
    objects: {
      collectibles: [
        { id: 'w12-mushroom', type: 'mushroom', value: 1000, x: 19, y: 5 },
        { id: 'w12-star', type: 'star', value: 2000, x: 43, y: 5 },
      ],
      enemies: [{ id: 'w12-piranha', type: 'piranha', x: 18, y: 7 }],
      spawners: [],
    },
    startPosition: { x: 1, y: 9 },
    tiles,
    version: '1.0.0',
  }
}
