export type PublicRuntimeConfig = {
  otelTracesEndpoint: string
  otelServiceName: string
}

declare global {
  interface Window {
    __TEST_PUBLIC__?: PublicRuntimeConfig
  }
}

/**
 * Reads the public runtime config that was injected into the document by the root loader's inline script.
 * @returns {PublicRuntimeConfig | undefined} The config object, or undefined if not yet available.
 */
export function readPublicRuntimeConfigFromWindow(): PublicRuntimeConfig | undefined {
  return globalThis.window?.__TEST_PUBLIC__
}
