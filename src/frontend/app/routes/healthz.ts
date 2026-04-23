/** Returns a simple health check response. */
export function loader(): Response {
  return Response.json({ status: 'ok' })
}
