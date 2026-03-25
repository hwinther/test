export interface LeaderboardEntry {
  name: string
  score: number
  ts: number
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch('/api/leaderboard')
  if (!res.ok) return []
  return (await res.json()) as LeaderboardEntry[]
}

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
