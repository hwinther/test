import Redis from 'ioredis'

const LEADERBOARD_KEY = 'mario:leaderboard'
const MAX_ENTRIES = 50

let redis: Redis | null = null

/**
 * Lazily create a shared Redis client from `REDIS_URL` (e.g. `redis://:password@host:6379/0`).
 * Defaults to local Redis when unset.
 * @returns {Redis} Connected `ioredis` instance
 */
function getRedis(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL ?? 'redis://localhost:6379'
    redis = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 3 })
    redis.on('error', (err) => {
      console.warn('[leaderboard] Redis connection error:', err.message)
    })
  }
  return redis
}

/**
 * Split a sorted-set member id `name|timestamp` used for tie-breaking.
 * @param {string} member - Raw Redis member string
 * @returns {{ name: string; ts: number }} Display name and insert time (ms), or `ts: 0`
 */
function parseMember(member: string): { name: string; ts: number } {
  const sepIdx = member.lastIndexOf('|')
  if (sepIdx >= 0) {
    return { name: member.slice(0, sepIdx), ts: Number.parseInt(member.slice(sepIdx + 1), 10) }
  }
  return { name: member, ts: 0 }
}

/**
 * GET /api/leaderboard -- return up to MAX_ENTRIES rows.
 * @returns {Promise<Response>} JSON array of `{ name, score, ts }`
 */
export async function loader(): Promise<Response> {
  try {
    const r = getRedis()
    const raw = await r.zrevrange(LEADERBOARD_KEY, 0, MAX_ENTRIES - 1, 'WITHSCORES')
    const entries: { name: string; score: number; ts: number }[] = []
    for (let i = 0; i < raw.length; i += 2) {
      const { name, ts } = parseMember(raw[i])
      entries.push({ name, score: Number.parseInt(raw[i + 1], 10), ts })
    }
    return Response.json(entries)
  } catch (err) {
    console.error('[leaderboard] API error:', err)
    return Response.json({ error: 'Leaderboard service unavailable' }, { status: 500 })
  }
}

/**
 * POST /api/leaderboard -- validate body, upsert score, trim tail, return rank.
 * @param {object} args - Route action args
 * @param {Request} args.request - Incoming request with JSON body `{ name, score }`
 * @returns {Promise<Response>} JSON `{ rank }` or error
 */
export async function action({ request }: { request: Request }): Promise<Response> {
  try {
    const r = getRedis()
    const { name, score } = (await request.json()) as { name: string; score: number }

    if (typeof name !== 'string' || name.length === 0 || name.length > 8) {
      return Response.json({ error: 'Name must be 1-8 characters' }, { status: 400 })
    }
    if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
      return Response.json({ error: 'Score must be a non-negative number' }, { status: 400 })
    }

    const ts = Date.now()
    const member = `${name.toUpperCase()}|${ts}`
    await r.zadd(LEADERBOARD_KEY, score, member)

    const rank = await r.zrevrank(LEADERBOARD_KEY, member)
    const total = await r.zcard(LEADERBOARD_KEY)

    if (total > MAX_ENTRIES) {
      await r.zremrangebyrank(LEADERBOARD_KEY, 0, total - MAX_ENTRIES - 1)
    }

    return Response.json({ rank: rank ?? -1 })
  } catch (err) {
    console.error('[leaderboard] API error:', err)
    return Response.json({ error: 'Leaderboard service unavailable' }, { status: 500 })
  }
}
