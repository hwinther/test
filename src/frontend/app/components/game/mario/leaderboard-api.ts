import { readPublicRuntimeConfigFromWindow } from '~/public-runtime-config'

export interface LeaderboardEntry {
  id?: string
  name: string
  score: number
  ts: number
}

const STORAGE_KEY = 'mario:leaderboard'
const MAX_ENTRIES = 50
let localEntries: LeaderboardEntry[] = []
let unsavedEntries = false

/**
 * Validates entries read from local storage or the shared leaderboard.
 * @param {unknown} value The entry to validate
 * @returns {boolean} Whether the entry can be displayed
 */
function isLeaderboardEntry(value: unknown): value is LeaderboardEntry {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof value.name === 'string' &&
    'score' in value &&
    typeof value.score === 'number' &&
    Number.isFinite(value.score) &&
    'ts' in value &&
    typeof value.ts === 'number' &&
    Number.isFinite(value.ts) &&
    (!('id' in value) || typeof value.id === 'string')
  )
}

/**
 * Saves a run to the browser and returns the resulting leaderboard.
 * @param {string} name Player name
 * @param {number} score Final run score
 * @returns {{ entries: LeaderboardEntry[]; rank: number }} The local board and zero-based player rank
 */
export function saveLocalScore(name: string, score: number): { entries: LeaderboardEntry[]; rank: number } {
  let entries = localEntries
  try {
    const saved: unknown = JSON.parse(globalThis.localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!unsavedEntries && Array.isArray(saved)) entries = saved.filter(isLeaderboardEntry)
  } catch {
    // Keep session scores available when persistent storage cannot be read.
  }

  const ts = entries.reduce((next, entry) => Math.max(next, entry.ts + 1), Date.now())
  const entry = { name: name.toUpperCase(), score, ts }
  localEntries = [...entries, entry].sort((a, b) => b.score - a.score || b.ts - a.ts).slice(0, MAX_ENTRIES)
  try {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(localEntries))
    unsavedEntries = false
  } catch {
    unsavedEntries = true
  }
  return { entries: localEntries, rank: localEntries.indexOf(entry) }
}

/**
 * Submits a run to the shared leaderboard when it is configured.
 * @param {string} name Player name
 * @param {number} score Final run score
 * @returns {Promise<{ entries: LeaderboardEntry[]; rank: number } | undefined>} The shared board and zero-based rank if enabled
 */
export async function submitSharedScore(
  name: string,
  score: number,
): Promise<{ entries: LeaderboardEntry[]; rank: number } | undefined> {
  if (!readPublicRuntimeConfigFromWindow()?.sharedLeaderboardEnabled) return undefined

  const response = await fetch('/resources/leaderboard', {
    body: JSON.stringify({ name, score }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    signal: AbortSignal.timeout(2000),
  })
  if (!response.ok) throw new Error('Shared leaderboard unavailable')

  const data = (await response.json()) as { entries?: unknown; rank?: unknown } | null
  if (!Array.isArray(data?.entries) || !data.entries.every(isLeaderboardEntry) || typeof data.rank !== 'number') {
    throw new Error('Invalid shared leaderboard response')
  }
  return { entries: data.entries, rank: data.rank }
}
