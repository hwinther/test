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
function getApiBaseUrl(): string {
  // eslint-disable-next-line sonarjs/different-types-comparison -- SSR: window is undefined on the server
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

/**
 * Orval mutator: generated clients call `customInstance(url, { method, headers, body, signal, … })`.
 * Axios expects `url` on the config object and `data` (not `body`) for JSON bodies.
 */
export const customInstance = async <T>(
  url: string,
  config?: AxiosRequestConfig & RequestInit,
): Promise<T> => {
  const source = Axios.CancelToken.source()
  const { body, ...rest } = config ?? {}
  const promise = AXIOS_INSTANCE({
    ...rest,
    url,
    ...(body !== undefined ? { data: body } : {}),
    cancelToken: source.token,
  }).then(({ data }) => data)

  // @ts-expect-error cancel is not in the type definition
  promise.cancel = () => {
    source.cancel('Query was cancelled by Vue Query')
  }

  return await promise
}

export default customInstance

export interface ErrorType<Error> extends AxiosError<Error> {}
