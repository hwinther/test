/**
 * Orval types often use `{ status, data }` unions; `customInstance` returns the JSON body (entity, array, or envelope).
 * @template T Expected payload type after unwrap.
 * @param {unknown} data Value from `useQuery().data`.
 * @returns {T | undefined} Unwrapped payload, or undefined for null/undefined input.
 */
export function unwrapOrvalBody<T>(data: unknown): T | undefined {
  if (data == null) return undefined
  if (Array.isArray(data)) return data as T
  const o = data as Record<string, unknown>
  if (o.status === 200 && 'data' in o) return o.data as T
  return data as T
}
