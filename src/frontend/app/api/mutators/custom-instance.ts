import Axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

import {
  DEFAULT_PUBLIC_API_BASE_URL,
  readApiBaseUrlFromProcessEnv,
  readPublicRuntimeConfigFromWindow,
} from '~/public-runtime-config'

/**
 * Resolves Axios base URL: injected `window` config in the browser, process env on the server.
 * @returns {string} API origin with trailing slash.
 */
export function getApiBaseUrl(): string {
  // SSR: window is undefined on the server
  if (globalThis.window !== undefined) {
    const fromWindow = readPublicRuntimeConfigFromWindow()?.apiBaseUrl?.trim()
    if (fromWindow) return fromWindow.endsWith('/') ? fromWindow : `${fromWindow}/`
    const fromVite = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
    if (fromVite) return fromVite.endsWith('/') ? fromVite : `${fromVite}/`
    return DEFAULT_PUBLIC_API_BASE_URL
  }
  return readApiBaseUrlFromProcessEnv()
}

export const AXIOS_INSTANCE = Axios.create({
  baseURL: getApiBaseUrl(),
})

let _authToken: string | null = null

/**
 * Updates the Bearer token injected into every outgoing API request.
 * Called by the TokenBridge component whenever the OIDC session changes.
 * @param {string | null} token Access token, or null to clear it.
 */
export function setAuthToken(token: string | null): void {
  _authToken = token
}

AXIOS_INSTANCE.interceptors.request.use((config) => {
  if (_authToken) {
    config.headers.Authorization = `Bearer ${_authToken}`
  }
  return config
})

/**
 * Orval mutator: generated clients call `customInstance(url, { method, headers, body, signal, … })`.
 * Axios expects `url` on the config object and `data` (not `body`) for JSON bodies.
 * @template T - Response body type.
 * @param {string} url - Request path (relative to baseURL).
 * @param {AxiosRequestConfig & RequestInit} [config] - Merged Axios/fetch config from the generated client.
 * @returns {Promise<T>} Resolved response body.
 */
export const customInstance = async <T>(
  url: string,
  config?: AxiosRequestConfig & RequestInit,
): Promise<T> => {
  // AbortController rather than Axios's deprecated CancelToken; a signal from the caller still aborts.
  const controller = new AbortController()
  const { body, signal, ...rest } = config ?? {}
  const promise = AXIOS_INSTANCE({
    ...rest,
    url,
    ...(body !== undefined ? { data: body } : {}),
    signal: signal ? AbortSignal.any([signal, controller.signal]) : controller.signal,
  }).then(({ data }) => data)

  // @ts-expect-error cancel is not in the type definition
  promise.cancel = () => {
    controller.abort('Query was cancelled')
  }

  return await promise
}

export default customInstance

export type ErrorType<Error> = AxiosError<Error>
