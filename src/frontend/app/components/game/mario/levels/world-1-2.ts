import type { LevelData, LevelTile } from '../level-format'

/**
 * Underground 1-2: pits, brick platforming, pipe piranhas, and a star.
 * @returns {LevelData} Fresh level definition (new tile grids each call)
 */
export function createWorld1Dash2Level(): LevelData {
  const width = 100
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

  // Ground with pit gaps
  const pitRanges: Array<[number, number]> = [
    [11, 14],
    [22, 25],
    [34, 37],
    [48, 51],
    [62, 65],
    [78, 81],
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

  // --- Brick platforms ---
  for (let col = 16; col < 20; col++) {
    tiles[9][col] = { id: `w12-brick-a-${col}`, properties: { breakable: true }, type: 'brick' }
  }
  for (let col = 27; col < 32; col++) {
    tiles[8][col] = { id: `w12-brick-b-${col}`, properties: { breakable: true }, type: 'brick' }
  }
  for (let col = 40; col < 45; col++) {
    tiles[7][col] = { id: `w12-brick-c-${col}`, properties: { breakable: true }, type: 'brick' }
  }
  for (let col = 54; col < 59; col++) {
    tiles[9][col] = { id: `w12-brick-d-${col}`, properties: { breakable: true }, type: 'brick' }
  }
  for (let col = 67; col < 72; col++) {
    tiles[8][col] = { id: `w12-brick-e-${col}`, properties: { breakable: true }, type: 'brick' }
  }
  for (let col = 83; col < 88; col++) {
    tiles[7][col] = { id: `w12-brick-f-${col}`, properties: { breakable: true }, type: 'brick' }
  }
  // Stepping stones over the last pit
  for (let col = 78; col <= 81; col++) {
    tiles[9][col] = { id: `w12-bridge-${col}`, type: 'cloud' }
  }

  // --- Cloud platforms ---
  for (let col = 52; col < 56; col++) {
    tiles[6][col] = { id: `w12-cloud-a-${col}`, type: 'cloud' }
  }
  for (let col = 73; col < 77; col++) {
    tiles[5][col] = { id: `w12-cloud-b-${col}`, type: 'cloud' }
  }
  for (let col = 90; col < 94; col++) {
    tiles[6][col] = { id: `w12-cloud-c-${col}`, type: 'cloud' }
  }

  // --- Pipes ---
  for (let row = 7; row < 11; row++) {
    tiles[row][18] = { id: `w12-pipe-a-l-${row}`, type: 'pipe' }
    tiles[row][19] = { id: `w12-pipe-a-r-${row}`, type: 'pipe' }
  }
  for (let row = 8; row < 11; row++) {
    tiles[row][46] = { id: `w12-pipe-b-l-${row}`, type: 'pipe' }
    tiles[row][47] = { id: `w12-pipe-b-r-${row}`, type: 'pipe' }
  }
  for (let row = 7; row < 11; row++) {
    tiles[row][75] = { id: `w12-pipe-c-l-${row}`, type: 'pipe' }
    tiles[row][76] = { id: `w12-pipe-c-r-${row}`, type: 'pipe' }
  }

  // --- Coins ---
  tiles[8][5] = { id: 'w12-coin-1', type: 'coin' }
  tiles[8][17] = { id: 'w12-coin-2', type: 'coin' }
  tiles[7][29] = { id: 'w12-coin-3', type: 'coin' }
  tiles[6][42] = { id: 'w12-coin-4', type: 'coin' }
  tiles[8][56] = { id: 'w12-coin-5', type: 'coin' }
  tiles[7][69] = { id: 'w12-coin-6', type: 'coin' }
  tiles[5][74] = { id: 'w12-coin-7', type: 'coin' }
  tiles[6][85] = { id: 'w12-coin-8', type: 'coin' }
  tiles[5][91] = { id: 'w12-coin-9', type: 'coin' }

  // --- Enemies ---
  tiles[10][8] = { id: 'w12-g1', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
  tiles[10][30] = { id: 'w12-g2', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
  tiles[10][44] = { id: 'w12-k1', properties: { enemyType: 'koopa' }, type: 'enemy-spawn' }
  tiles[10][57] = { id: 'w12-g3', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
  tiles[10][70] = { id: 'w12-g4', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
  tiles[10][85] = { id: 'w12-k2', properties: { enemyType: 'koopa' }, type: 'enemy-spawn' }
  tiles[10][92] = { id: 'w12-g5', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }

  return {
    dimensions: {
      height,
      tileSize,
      width,
    },
    flagPole: {
      x: 96,
      y: 3,
    },
    id: 'default-level-2',
    metadata: {
      author: 'System',
      description: 'Underground caverns and bottomless pits',
      difficulty: 2,
      theme: 'underground',
      timeLimit: 450,
    },
    name: 'World 1-2',
    objects: {
      collectibles: [
        { id: 'w12-mushroom', type: 'mushroom', value: 1000, x: 19, y: 5 },
        { id: 'w12-star', type: 'star', value: 2000, x: 43, y: 5 },
        { id: 'w12-mushroom-2', type: 'mushroom', value: 1000, x: 55, y: 7 },
        { id: 'w12-flower', type: 'fireflower', value: 500, x: 86, y: 5 },
      ],
      enemies: [
        { id: 'w12-piranha-1', type: 'piranha', x: 18, y: 7 },
        { id: 'w12-piranha-2', type: 'piranha', x: 46, y: 8 },
        { id: 'w12-piranha-3', type: 'piranha', x: 75, y: 7 },
      ],
      spawners: [],
    },
    startPosition: { x: 1, y: 9 },
    tiles,
    version: '1.0.0',
  }
}
