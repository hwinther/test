import type { LevelData, LevelTile } from '../level-format'

interface Course {
  stage: 1 | 2 | 3
  theme: LevelData['metadata']['theme']
  description: string
  rows: Record<number, string>
}

/**
 * Read the built-in tile maps into the same format used for editor imports.
 * @param {Course} course - Each character occupies one tile. Row eleven is the floor.
 * @returns {LevelData} A fresh editable copy of the course.
 */
export function buildCourse({ stage, theme, description, rows }: Course): LevelData {
  const width = rows[11].length
  const objects: LevelData['objects'] = { collectibles: [], enemies: [], spawners: [] }
  const terrain: Record<string, LevelTile['type']> = { '#': 'ground', '=': 'cloud', B: 'brick', o: 'coin', P: 'pipe' }
  const tiles = Array.from({ length: 13 }, (_, y) =>
    Array.from({ length: width }, (_, x): LevelTile => {
      const mark = rows[y]?.[x] ?? ' '
      const id = `tile-${y}-${x}`
      if (mark === 'g' || mark === 'k' || mark === '^') {
        const enemies = { '^': 'piranha', g: 'goomba', k: 'koopa' }
        objects.enemies.push({ id, type: enemies[mark], x, y })
      }
      if (mark === 'm' || mark === 'f' || mark === '*') {
        const items = { '*': 'star', f: 'fireflower', m: 'mushroom' }
        objects.collectibles.push({ id, type: items[mark], value: 1000, x, y })
      }
      return { id, type: terrain[mark] ?? 'air' }
    }),
  )

  return {
    dimensions: { height: 13, tileSize: 32, width },
    flagPole: { x: width - 3, y: 3.5 },
    id: `default-level-${stage}`,
    metadata: { author: 'System', description, difficulty: stage, theme, timeLimit: 240 },
    name: `Bane 1-${stage}`,
    objects,
    startPosition: { x: 1, y: 10 },
    tiles,
    version: '1.0.0',
  }
}
