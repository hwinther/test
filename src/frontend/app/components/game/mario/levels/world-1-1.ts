import type { LevelData, LevelTile } from '../level-format'

/**
 * Overworld 1-1: ground course with pipes, bricks, and a few enemies.
 * @returns {LevelData} Fresh level definition (new tile grids each call)
 */
export function createWorld1Dash1Level(): LevelData {
  const width = 100
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

  // Ground (full width)
  for (let col = 0; col < width; col++) {
    tiles[11][col] = {
      id: `ground-${col}`,
      type: 'ground',
    }
  }

  // --- Brick platforms ---
  for (let col = 6; col < 10; col++) {
    tiles[9][col] = { id: `brick-a-${col}`, properties: { breakable: true }, type: 'brick' }
  }
  for (let col = 12; col < 16; col++) {
    tiles[7][col] = { id: `brick-b-${col}`, properties: { breakable: true }, type: 'brick' }
  }
  for (let col = 42; col < 47; col++) {
    tiles[9][col] = { id: `brick-c-${col}`, properties: { breakable: true }, type: 'brick' }
  }
  for (let col = 50; col < 54; col++) {
    tiles[7][col] = { id: `brick-d-${col}`, properties: { breakable: true }, type: 'brick' }
  }
  for (let col = 62; col < 66; col++) {
    tiles[8][col] = { id: `brick-e-${col}`, properties: { breakable: true }, type: 'brick' }
  }
  for (let col = 75; col < 80; col++) {
    tiles[9][col] = { id: `brick-f-${col}`, properties: { breakable: true }, type: 'brick' }
  }
  for (let col = 82; col < 86; col++) {
    tiles[7][col] = { id: `brick-g-${col}`, properties: { breakable: true }, type: 'brick' }
  }
  // Staircase near the end
  for (let step = 0; step < 4; step++) {
    for (let col = 88; col <= 88 + step; col++) {
      tiles[10 - step][col] = { id: `stair-${step}-${col}`, type: 'ground' }
    }
  }

  // --- Cloud platforms ---
  for (let col = 18; col < 22; col++) {
    tiles[6][col] = { id: `cloud-a-${col}`, type: 'cloud' }
  }
  for (let col = 25; col < 29; col++) {
    tiles[4][col] = { id: `cloud-b-${col}`, type: 'cloud' }
  }
  for (let col = 56; col < 60; col++) {
    tiles[5][col] = { id: `cloud-c-${col}`, type: 'cloud' }
  }
  for (let col = 70; col < 74; col++) {
    tiles[4][col] = { id: `cloud-d-${col}`, type: 'cloud' }
  }

  // --- Pipes ---
  for (let row = 7; row < 11; row++) {
    tiles[row][31] = { id: `pipe-31-${row}`, type: 'pipe' }
    tiles[row][32] = { id: `pipe-32-${row}`, type: 'pipe' }
  }
  for (let row = 6; row < 11; row++) {
    tiles[row][37] = { id: `pipe-37-${row}`, type: 'pipe' }
    tiles[row][38] = { id: `pipe-38-${row}`, type: 'pipe' }
  }
  for (let row = 8; row < 11; row++) {
    tiles[row][60] = { id: `pipe-60-${row}`, type: 'pipe' }
    tiles[row][61] = { id: `pipe-61-${row}`, type: 'pipe' }
  }
  for (let row = 7; row < 11; row++) {
    tiles[row][80] = { id: `pipe-80-${row}`, type: 'pipe' }
    tiles[row][81] = { id: `pipe-81-${row}`, type: 'pipe' }
  }

  // --- Coins (tile-based) ---
  tiles[8][7] = { id: 'coin-1', type: 'coin' }
  tiles[6][13] = { id: 'coin-2', type: 'coin' }
  tiles[5][19] = { id: 'coin-3', type: 'coin' }
  tiles[8][44] = { id: 'coin-4', type: 'coin' }
  tiles[6][52] = { id: 'coin-5', type: 'coin' }
  tiles[4][57] = { id: 'coin-6', type: 'coin' }
  tiles[3][71] = { id: 'coin-7', type: 'coin' }
  tiles[7][64] = { id: 'coin-8', type: 'coin' }
  tiles[8][77] = { id: 'coin-9', type: 'coin' }
  tiles[6][84] = { id: 'coin-10', type: 'coin' }

  // --- Enemies (tile-based) ---
  tiles[10][9] = { id: 'goomba-1', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
  tiles[10][15] = { id: 'goomba-2', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
  tiles[10][22] = { id: 'koopa-1', properties: { enemyType: 'koopa' }, type: 'enemy-spawn' }
  tiles[10][45] = { id: 'goomba-3', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
  tiles[10][53] = { id: 'goomba-4', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
  tiles[10][65] = { id: 'koopa-2', properties: { enemyType: 'koopa' }, type: 'enemy-spawn' }
  tiles[10][76] = { id: 'goomba-5', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
  tiles[10][85] = { id: 'goomba-6', properties: { enemyType: 'goomba' }, type: 'enemy-spawn' }
  tiles[10][90] = { id: 'koopa-3', properties: { enemyType: 'koopa' }, type: 'enemy-spawn' }

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
    id: 'default-level-1',
    metadata: {
      author: 'System',
      description: 'The classic first level',
      difficulty: 1,
      theme: 'overworld',
      timeLimit: 500,
    },
    name: 'World 1-1',
    objects: {
      collectibles: [
        { id: 'mushroom-1', type: 'mushroom', value: 1000, x: 26, y: 3 },
        { id: 'flower-1', type: 'fireflower', value: 500, x: 28, y: 3 },
        { id: 'mushroom-2', type: 'mushroom', value: 1000, x: 58, y: 4 },
        { id: 'star-1', type: 'star', value: 2000, x: 72, y: 3 },
      ],
      enemies: [
        { id: 'piranha-1', type: 'piranha', x: 31, y: 7 },
        { id: 'piranha-2', type: 'piranha', x: 60, y: 8 },
        { id: 'piranha-3', type: 'piranha', x: 80, y: 7 },
      ],
      spawners: [],
    },
    startPosition: { x: 1, y: 9 },
    tiles,
    version: '1.0.0',
  }
}
