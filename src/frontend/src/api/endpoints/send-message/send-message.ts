//@ts-nocheck
import { useQuery } from '@tanstack/react-query'
import type { QueryFunction, QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { customInstance } from '../../mutators/custom-instance'
import type { ErrorType } from '../../mutators/custom-instance'

/**
 * @summary TODO
 */
export const getSendMessage = (signal?: AbortSignal) => {
  return customInstance<string>({ url: `/SendMessage`, method: 'GET', signal })
}

export const getGetSendMessageQueryKey = () => {
  return [`/SendMessage`] as const
}

export const getGetSendMessageQueryOptions = <
  TData = Awaited<ReturnType<typeof getSendMessage>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getSendMessage>>, TError, TData>>
}) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetSendMessageQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getSendMessage>>> = ({ signal }) => getSendMessage(signal)

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getSendMessage>>,
    TError,
    TData
  > & { queryKey: QueryKey }
}

export type GetSendMessageQueryResult = NonNullable<Awaited<ReturnType<typeof getSendMessage>>>
export type GetSendMessageQueryError = ErrorType<unknown>

/**
 * @summary TODO
 */
export const useGetSendMessage = <
  TData = Awaited<ReturnType<typeof getSendMessage>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getSendMessage>>, TError, TData>>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetSendMessageQueryOptions(options)

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryOptions.queryKey

  return query
}
