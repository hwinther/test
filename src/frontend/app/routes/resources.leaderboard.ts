import { createClient } from 'redis'

const LEADERBOARD_KEY = 'mario:leaderboard'
const MAX_ENTRIES = 50

type RedisClient = ReturnType<typeof createClient>
let redis: RedisClient | null = null

/**
 * Lazily create and connect a shared Redis client from `REDIS_URL`.
 * Accepts the standard `redis://:password@host:port/db` URL format.
 * @returns {Promise<RedisClient>} Connected client.
 */
async function getRedis(): Promise<RedisClient> {
  if (!redis) {
    const url = process.env.REDIS_URL ?? 'redis://localhost:6379'
    redis = createClient({ url })
    redis.on('error', (err: Error) => {
      console.warn('[leaderboard] Redis connection error:', err.message)
    })
  }
  if (!redis.isOpen) {
    await redis.connect()
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
 * GET /resources/leaderboard -- return up to MAX_ENTRIES rows.
 * @returns {Promise<Response>} JSON array of `{ name, score, ts }`
 */
export async function loader(): Promise<Response> {
  try {
    const r = await getRedis()
    const raw = await r.zRangeWithScores(LEADERBOARD_KEY, 0, MAX_ENTRIES - 1, { REV: true })
    const entries = raw.map(({ value, score }) => {
      const { name, ts } = parseMember(value)
      return { name, score: Math.round(score), ts }
    })
    return Response.json(entries)
  } catch (err) {
    console.error('[leaderboard] API error:', err)
    return Response.json({ error: 'Leaderboard service unavailable' }, { status: 500 })
  }
}

/**
 * POST /resources/leaderboard -- validate body, upsert score, trim tail, return rank.
 * @param {object} args - Route action args
 * @param {Request} args.request - Incoming request with JSON body `{ name, score }`
 * @returns {Promise<Response>} JSON `{ rank }` or error
 */
export async function action({ request }: { request: Request }): Promise<Response> {
  try {
    const r = await getRedis()
    const { name, score } = (await request.json()) as { name: string; score: number }

    if (typeof name !== 'string' || name.length === 0 || name.length > 8) {
      return Response.json({ error: 'Name must be 1-8 characters' }, { status: 400 })
    }
    if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
      return Response.json({ error: 'Score must be a non-negative number' }, { status: 400 })
    }

    const ts = Date.now()
    const member = `${name.toUpperCase()}|${ts}`
    await r.zAdd(LEADERBOARD_KEY, { score, value: member })

    const rank = await r.zRevRank(LEADERBOARD_KEY, member)
    const total = await r.zCard(LEADERBOARD_KEY)

    if (total > MAX_ENTRIES) {
      await r.zRemRangeByRank(LEADERBOARD_KEY, 0, total - MAX_ENTRIES - 1)
    }

    return Response.json({ rank: rank ?? -1 })
  } catch (err) {
    console.error('[leaderboard] API error:', err)
    return Response.json({ error: 'Leaderboard service unavailable' }, { status: 500 })
  }
}
