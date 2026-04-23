/**
 * Returns a simple health check response.
 * @returns {Response} JSON response with status ok
 */
export function loader(): Response {
  return Response.json({ status: 'ok' })
}
