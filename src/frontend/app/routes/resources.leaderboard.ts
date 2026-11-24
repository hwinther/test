import { randomUUID } from 'node:crypto'
import { createClient } from 'redis'

import { readLeaderboardRedisUrl } from '~/public-runtime-config'

const LEADERBOARD_KEY = 'mario:leaderboard'
const MAX_ENTRIES = 50
const REDIS_TIMEOUT_MS = 1000

type RedisClient = ReturnType<typeof createLeaderboardRedis>
let connection: { client: RedisClient; ready: Promise<RedisClient> } | undefined

/**
 * Creates a client that rejects requests while it is disconnected.
 * @param {string} url The configured Redis URL
 * @returns {RedisClient} The new client
 */
function createLeaderboardRedis(url: string) {
  return createClient({
    disableOfflineQueue: true,
    maintNotifications: 'disabled',
    socket: { connectTimeout: REDIS_TIMEOUT_MS, reconnectStrategy: false },
    url,
  }).on('error', (error: Error) => console.warn('[leaderboard] Redis error:', error.message))
}

/**
 * Run a leaderboard operation using a shared Redis connection and a request deadline.
 * @template T
 * @param {string} url Configured Redis URL
 * @param {(client: RedisClient) => Promise<T>} operation Redis commands for the request
 * @returns {Promise<T>} The result of the operation
 */
async function useRedis<T>(url: string, operation: (client: RedisClient) => Promise<T>): Promise<T> {
  if (!connection?.client.isOpen) {
    const client = createLeaderboardRedis(url)
    connection = { client, ready: client.connect() }
  }

  const { client, ready } = connection
  let timeout: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      ready.then(operation),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          if (client.isOpen) client.destroy()
          reject(new Error('Redis leaderboard timed out'))
        }, REDIS_TIMEOUT_MS)
      }),
    ])
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Convert sorted-set rows to entries, including members from earlier versions.
 * @param {{ value: string; score: number }[]} rows Redis sorted-set rows in descending order
 * @returns {{ id: string; name: string; score: number; ts: number }[]} Entries ready for display
 */
function toEntries(
  rows: { value: string; score: number }[],
): { id: string; name: string; score: number; ts: number }[] {
  return rows.map(({ value, score }) => {
    const separator = value.lastIndexOf('|')
    const name = separator < 0 ? value : value.slice(0, separator)
    const ts = separator < 0 ? 0 : Number.parseInt(value.slice(separator + 1), 10)
    return { id: value, name, score: Math.round(score), ts: Number.isFinite(ts) ? ts : 0 }
  })
}

/**
 * Reads the shared leaderboard.
 * @returns {Promise<Response>} The leaderboard or its availability status
 */
export async function loader(): Promise<Response> {
  const url = readLeaderboardRedisUrl()
  if (!url) return new Response(null, { status: 404 })

  try {
    const rows = await useRedis(url, (client) =>
      client.zRangeWithScores(LEADERBOARD_KEY, 0, MAX_ENTRIES - 1, { REV: true }),
    )
    return Response.json(toEntries(rows))
  } catch {
    return Response.json({ error: 'Poenglisten er utilgjengelig' }, { status: 503 })
  }
}

/**
 * Validates and stores a score, then returns the shared board and its new rank.
 * @param {object} args Route action args
 * @param {Request} args.request Incoming JSON request
 * @returns {Promise<Response>} The updated leaderboard or an error response
 */
export async function action({ request }: { request: Request }): Promise<Response> {
  const url = readLeaderboardRedisUrl()
  if (!url) return new Response(null, { status: 404 })
  if (request.method !== 'POST') return new Response(null, { headers: { Allow: 'POST' }, status: 405 })

  const data = (await request.json().catch(() => null)) as { name?: unknown; score?: unknown } | null
  const name = typeof data?.name === 'string' ? data.name.trim() : ''
  const score = data?.score
  if (!/^[a-zA-ZæøåÆØÅ0-9 ]{1,8}$/.test(name)) {
    return Response.json({ error: 'Navnet må bestå av 1–8 bokstaver, sifre eller mellomrom' }, { status: 400 })
  }
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
    return Response.json({ error: 'Poengsummen må være null eller høyere' }, { status: 400 })
  }

  const member = `${name.toUpperCase()}|${Date.now()}-${randomUUID()}`
  try {
    const [, , rows] = await useRedis(url, (client) =>
      client
        .multi()
        .zAdd(LEADERBOARD_KEY, { score, value: member })
        .zRemRangeByRank(LEADERBOARD_KEY, 0, -MAX_ENTRIES - 1)
        .zRangeWithScores(LEADERBOARD_KEY, 0, MAX_ENTRIES - 1, { REV: true })
        .execTyped(),
    )
    return Response.json({ entries: toEntries(rows), rank: rows.findIndex(({ value }) => value === member) })
  } catch {
    return Response.json({ error: 'Poenglisten er utilgjengelig' }, { status: 503 })
  }
}
