export type PublicRuntimeConfig = {
  /** Backend API origin for browser and SSR HTTP clients (from PUBLIC_API_BASE_URL or VITE_API_BASE_URL). */
  apiBaseUrl: string
  otelTracesEndpoint: string
  otelServiceName: string
}

/** Default when no env override is set (local dev). */
export const DEFAULT_PUBLIC_API_BASE_URL = 'https://localhost:7156/'

function withTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`
}

/**
 * Resolves the public API base URL from process env (Node / SSR / react-router-serve).
 * Prefer PUBLIC_* in production so the same image can target different backends without a rebuild.
 */
export function readApiBaseUrlFromProcessEnv(): string {
  const raw = process.env.PUBLIC_API_BASE_URL?.trim() || process.env.VITE_API_BASE_URL?.trim()
  if (!raw) return DEFAULT_PUBLIC_API_BASE_URL
  return withTrailingSlash(raw)
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
