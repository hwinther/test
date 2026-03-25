export interface LeaderboardEntry {
  name: string
  score: number
  ts: number
}

/**
 * Load the public high-score list from the dev-server `/api/leaderboard` route.
 * @returns {Promise<LeaderboardEntry[]>} Latest entries, or an empty array on HTTP error
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch('/api/leaderboard')
  if (!res.ok) return []
  return (await res.json()) as LeaderboardEntry[]
}

/**
 * POST a score under the given display name (server stores the tag in uppercase).
 * @param {string} name - Player tag (letters, digits, spaces)
 * @param {number} score - Final run score
 * @returns {Promise<number>} 1-based rank if accepted, or `-1` on failure
 */
export async function submitScore(name: string, score: number): Promise<number> {
  const res = await fetch('/api/leaderboard', {
    body: JSON.stringify({ name: name.toUpperCase(), score }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  if (!res.ok) return -1
  const data = (await res.json()) as { rank: number }
  return data.rank
}
