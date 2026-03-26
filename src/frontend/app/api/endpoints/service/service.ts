//@ts-nocheck
import { useQuery } from '@tanstack/react-query'
import type { QueryFunction, QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import type { StringGenericValue, VersionInformation } from '../../models'
import { customInstance } from '../../mutators/custom-instance'
import type { ErrorType } from '../../mutators/custom-instance'

/**
 * @summary Returns ok
 */
export const ping = (signal?: AbortSignal) => {
  return customInstance<StringGenericValue>({ url: `/Service/ping`, method: 'GET', signal })
}

export const getPingQueryKey = () => {
  return [`/Service/ping`] as const
}

export const getPingQueryOptions = <TData = Awaited<ReturnType<typeof ping>>, TError = ErrorType<void>>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof ping>>, TError, TData>>
}) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getPingQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof ping>>> = ({ signal }) => ping(signal)

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof ping>>, TError, TData> & {
    queryKey: QueryKey
  }
}

export type PingQueryResult = NonNullable<Awaited<ReturnType<typeof ping>>>
export type PingQueryError = ErrorType<void>

/**
 * @summary Returns ok
 */
export const usePing = <TData = Awaited<ReturnType<typeof ping>>, TError = ErrorType<void>>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof ping>>, TError, TData>>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getPingQueryOptions(options)

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryOptions.queryKey

  return query
}

/**
 * @summary Returns version
 */
export const version = (signal?: AbortSignal) => {
  return customInstance<VersionInformation>({ url: `/Service/version`, method: 'GET', signal })
}

export const getVersionQueryKey = () => {
  return [`/Service/version`] as const
}

export const getVersionQueryOptions = <
  TData = Awaited<ReturnType<typeof version>>,
  TError = ErrorType<void>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof version>>, TError, TData>>
}) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getVersionQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof version>>> = ({ signal }) => version(signal)

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof version>>,
    TError,
    TData
  > & { queryKey: QueryKey }
}

export type VersionQueryResult = NonNullable<Awaited<ReturnType<typeof version>>>
export type VersionQueryError = ErrorType<void>

/**
 * @summary Returns version
 */
export const useVersion = <TData = Awaited<ReturnType<typeof version>>, TError = ErrorType<void>>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof version>>, TError, TData>>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getVersionQueryOptions(options)

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryOptions.queryKey

  return query
}
