import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

import Redis from 'ioredis'

const LEADERBOARD_KEY = 'mario:leaderboard'
const MAX_ENTRIES = 50

/**
 * Read the full HTTP request body as UTF-8 text.
 * @param {IncomingMessage} req - Raw Node request stream
 * @returns {Promise<string>} Body string
 */
function parseBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

/**
 * Serialize JSON and end the HTTP response.
 * @param {ServerResponse} res - Node response
 * @param {number} status - HTTP status
 * @param {unknown} data - Value to `JSON.stringify`
 * @returns {void}
 */
function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

/**
 * Vite plugin: dev-server middleware backed by Redis sorted sets for Mario high scores.
 * @returns {Plugin} Vite `Plugin` with `configureServer` hook
 */
export function leaderboardPlugin(): Plugin {
  let redis: Redis | null = null

  /**
   * Lazily create a shared Redis client (reads `REDIS_HOST` / `REDIS_PORT`).
   * @returns {Redis} Connected `ioredis` instance
   */
  function getRedis(): Redis {
    if (!redis) {
      const host = process.env.REDIS_HOST ?? 'localhost'
      const port = Number.parseInt(process.env.REDIS_PORT ?? '6379', 10)
      redis = new Redis({ host, port, lazyConnect: true, maxRetriesPerRequest: 3 })
      redis.on('error', (err) => {
        console.warn('[leaderboard] Redis connection error:', err.message)
      })
    }
    return redis
  }

  return {
    name: 'vite-plugin-leaderboard',

    configureServer(server) {
      server.middlewares.use('/api/leaderboard', (req, res, next) => {
        void handleLeaderboard(req, res, next, getRedis)
      })
    },
  }
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
 * GET: return up to `MAX_ENTRIES` rows as `{ name, score, ts }[]`.
 * @param {Redis} r - Redis client
 * @param {ServerResponse} res - HTTP response
 * @returns {Promise<void>}
 */
async function handleGet(r: Redis, res: ServerResponse): Promise<void> {
  const raw = await r.zrevrange(LEADERBOARD_KEY, 0, MAX_ENTRIES - 1, 'WITHSCORES')
  const entries: { name: string; score: number; ts: number }[] = []
  for (let i = 0; i < raw.length; i += 2) {
    const { name, ts } = parseMember(raw[i])
    entries.push({ name, score: Number.parseInt(raw[i + 1], 10), ts })
  }
  sendJson(res, 200, entries)
}

/**
 * POST: validate body, upsert score, trim the tail of the leaderboard, return 0-based rank.
 * @param {Redis} r - Redis client
 * @param {IncomingMessage} req - Request with JSON body `{ name, score }`
 * @param {ServerResponse} res - HTTP response
 * @returns {Promise<void>}
 */
async function handlePost(r: Redis, req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await parseBody(req)
  const { name, score } = JSON.parse(body) as { name: string; score: number }

  if (typeof name !== 'string' || name.length === 0 || name.length > 8) {
    sendJson(res, 400, { error: 'Name must be 1-8 characters' })
    return
  }
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
    sendJson(res, 400, { error: 'Score must be a non-negative number' })
    return
  }

  const ts = Date.now()
  const member = `${name.toUpperCase()}|${ts}`
  await r.zadd(LEADERBOARD_KEY, score, member)

  const rank = await r.zrevrank(LEADERBOARD_KEY, member)
  const total = await r.zcard(LEADERBOARD_KEY)

  if (total > MAX_ENTRIES) {
    await r.zremrangebyrank(LEADERBOARD_KEY, 0, total - MAX_ENTRIES - 1)
  }

  sendJson(res, 200, { rank: rank ?? -1 })
}

/**
 * Route `GET` / `POST` for `/api/leaderboard`; otherwise call `next()`.
 * @param {IncomingMessage} req - Incoming request
 * @param {ServerResponse} res - Outgoing response
 * @param {() => void} next - Connect fallback
 * @param {() => Redis} getRedis - Lazy Redis accessor
 * @returns {Promise<void>}
 */
async function handleLeaderboard(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
  getRedis: () => Redis,
): Promise<void> {
  try {
    const r = getRedis()

    if (req.method === 'GET') {
      await handleGet(r, res)
      return
    }

    if (req.method === 'POST') {
      await handlePost(r, req, res)
      return
    }

    next()
  } catch (err) {
    console.error('[leaderboard] API error:', err)
    sendJson(res, 500, { error: 'Leaderboard service unavailable' })
  }
}
