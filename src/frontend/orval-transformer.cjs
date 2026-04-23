/**
 * Orval input transformer — strips endpoints that cannot be used via the Axios-based
 * code generator before generation runs.
 *
 * SSE streams require a persistent fetch-based connection and are handled by the
 * custom `useChatStream` hook; generating a standard React Query hook for them
 * would produce dead, misleading code.
 * @type {import('orval').DocumentTransformer}
 */
module.exports = (schema) => {
  const paths = schema.paths ?? {}

  // Chat moved to SignalR (/hubs/chat). Hubs don't appear in swagger.json, so nothing
  // to strip here — this entry is kept as a guard in case the path ever reappears.
  delete paths['/api/v1/Chat/stream']

  return schema
}
