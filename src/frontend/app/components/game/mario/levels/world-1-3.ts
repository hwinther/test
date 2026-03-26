import type { LevelData, LevelTile } from '../level-format'

/**
 * Castle 1-3: chasms with cloud bridges, stepping bricks, pipes, and a tougher enemy mix.
 * @returns {LevelData} Fresh level definition (new tile grids each call)
 */
export function createWorld1Dash3Level(): LevelData {
  const width = 100
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

  // Ground with two large chasms
  const pitRanges: Array<[number, number]> = [
    [26, 34],
    [60, 68],
  ]

  for (let col = 0; col < width; col++) {
    const inPit = pitRanges.some(([a, b]) => col >= a && col <= b)
    if (!inPit) {
      tiles[11][col] = {
        id: `w13-ground-${col}`,
        type: 'ground',
      }
    }
  }

  // --- Cloud bridges over chasms ---
  for (let col = 26; col <= 34; col++) {
    tiles[8][col] = { id: `w13-bridge-a-${col}`, type: 'cloud' }
  }
  for (let col = 60; col <= 68; col++) {
    tiles[8][col] = { id: `w13-bridge-b-${col}`, type: 'cloud' }
  }

  // --- Brick platforms ---
  for (let col = 8; col < 13; col++) {
    tiles[9][col] = { id: `w13-brick-lo-${col}`, properties: { breakable: true }, type: 'brick' }
  }
  for (let col = 38; col < 42; col++) {
    tiles[8][col] = { id: `w13-brick-mid-a-${col}`, properties: { breakable: true }, type: 'brick' }
  }
  for (let col = 45; col < 51; col++) {
    tiles[7][col] = { id: `w13-brick-hi-a-${col}`, properties: { breakable: true }, type: 'brick' }
  }
  for (let col = 70; col < 75; col++) {
    tiles[9][col] = { id: `w13-brick-lo-b-${col}`, properties: { breakable: true }, type: 'brick' }
  }
  for (let col = 77; col < 82; col++) {
    tiles[7][col] = { id: `w13-brick-hi-b-${col}`, properties: { breakable: true }, type: 'brick' }
  }
  for (let col = 85; col < 90; col++) {
    tiles[8][col] = { id: `w13-brick-mid-c-${col}`, properties: { breakable: true }, type: 'brick' }
  }
  // Staircase to the flag
  for (let step = 0; step < 4; step++) {
    for (let col = 91; col <= 91 + step; col++) {
      tiles[10 - step][col] = { id: `w13-stair-${step}-${col}`, type: 'ground' }
    }
  }

  // --- Cloud platforms (high) ---
  for (let col = 15; col < 19; col++) {
    tiles[5][col] = { id: `w13-cloud-a-${col}`, type: 'cloud' }
  }
  for (let col = 54; col < 58; col++) {
    tiles[6][col] = { id: `w13-cloud-b-${col}`, type: 'cloud' }
  }
  for (let col = 82; col < 86; col++) {
    tiles[5][col] = { id: `w13-cloud-c-${col}`, type: 'cloud' }
  }

  // --- Pipes ---
  for (let row = 7; row < 11; row++) {
    tiles[row][4] = { id: `w13-pipe-a-l-${row}`, type: 'pipe' }
    tiles[row][5] = { id: `w13-pipe-a-r-${row}`, type: 'pipe' }
  }
  for (let row = 8; row < 11; row++) {
    tiles[row][43] = { id: `w13-pipe-b-l-${row}`, type: 'pipe' }
    tiles[row][44] = { id: `w13-pipe-b-r-${row}`, type: 'pipe' }
  }
  for (let row = 7; row < 11; row++) {
    tiles[row][73] = { id: `w13-pipe-c-l-${row}`, type: 'pipe' }
    tiles[row][74] = { id: `w13-pipe-c-r-${row}`, type: 'pipe' }
  }

  // --- Coins ---
  tiles[7][20] = { id: 'w13-c1', type: 'coin' }
  tiles[7][36] = { id: 'w13-c2', type: 'coin' }
  tiles[6][47] = { id: 'w13-c3', type: 'coin' }
  tiles[4][16] = { id: 'w13-c4', type: 'coin' }
  tiles[5][55] = { id: 'w13-c5', type: 'coin' }
  tiles[7][63] = { id: 'w13-c6', type: 'coin' }
  tiles[8][72] = { id: 'w13-c7', type: 'coin' }
  tiles[6][79] = { id: 'w13-c8', type: 'coin' }
  tiles[4][83] = { id: 'w13-c9', type: 'coin' }
  tiles[7][87] = { id: 'w13-c10', type: 'coin' }

  // --- Enemies ---
  tiles[10][12] = { id: 'w13-g1', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
  tiles[10][18] = { id: 'w13-g2', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
  tiles[10][35] = { id: 'w13-k1', properties: { enemyType: 'koopa' }, type: 'enemy-spawn' }
  tiles[10][50] = { id: 'w13-k2', properties: { enemyType: 'koopa' }, type: 'enemy-spawn' }
  tiles[10][72] = { id: 'w13-g3', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
  tiles[10][80] = { id: 'w13-k3', properties: { enemyType: 'koopa' }, type: 'enemy-spawn' }
  tiles[10][88] = { id: 'w13-g4', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
  tiles[10][93] = { id: 'w13-k4', properties: { enemyType: 'koopa' }, type: 'enemy-spawn' }

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
    id: 'default-level-3',
    metadata: {
      author: 'System',
      description: 'Castle ramparts—bridge the chasm and climb to the flag',
      difficulty: 3,
      theme: 'castle',
      timeLimit: 420,
    },
    name: 'World 1-3',
    objects: {
      collectibles: [
        { id: 'w13-mushroom', type: 'mushroom', value: 1000, x: 10, y: 7 },
        { id: 'w13-flower', type: 'fireflower', value: 500, x: 48, y: 5 },
        { id: 'w13-star', type: 'star', value: 2000, x: 56, y: 4 },
        { id: 'w13-mushroom-2', type: 'mushroom', value: 1000, x: 84, y: 3 },
      ],
      enemies: [
        { id: 'w13-piranha-1', type: 'piranha', x: 4, y: 7 },
        { id: 'w13-piranha-2', type: 'piranha', x: 43, y: 8 },
        { id: 'w13-piranha-3', type: 'piranha', x: 73, y: 7 },
      ],
      spawners: [],
    },
    startPosition: { x: 1, y: 9 },
    tiles,
    version: '1.0.0',
  }
}
