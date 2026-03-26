import type { TextMapGetter } from '@opentelemetry/api'

export const headersTextMapGetter: TextMapGetter<Headers> = {
  keys(carrier) {
    return [...carrier.keys()]
  },
  get(carrier, key) {
    return carrier.get(key) ?? undefined
  },
}
