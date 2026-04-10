//@ts-nocheck
import { useQuery } from '@tanstack/react-query'
import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  QueryClient,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query'

import type { StringGenericValue } from '../../models'

import { customInstance } from '../../mutators/custom-instance'
import type { ErrorType } from '../../mutators/custom-instance'

/**
 * @summary Sends a message using the MessageSender service.
 */
export type getApiV1SendMessageResponse200 = {
  data: StringGenericValue
  status: 200
}

export type getApiV1SendMessageResponse500 = {
  data: void
  status: 500
}

export type getApiV1SendMessageResponseSuccess = getApiV1SendMessageResponse200 & {
  headers: Headers
}
export type getApiV1SendMessageResponseError = getApiV1SendMessageResponse500 & {
  headers: Headers
}

export type getApiV1SendMessageResponse = getApiV1SendMessageResponseSuccess | getApiV1SendMessageResponseError

export const getGetApiV1SendMessageUrl = () => {
  return `/api/v1/SendMessage`
}

export const getApiV1SendMessage = async (options?: RequestInit): Promise<getApiV1SendMessageResponse> => {
  return customInstance<getApiV1SendMessageResponse>(getGetApiV1SendMessageUrl(), {
    ...options,
    method: 'GET',
  })
}

export const getGetApiV1SendMessageQueryKey = () => {
  return [`/api/v1/SendMessage`] as const
}

export const getGetApiV1SendMessageQueryOptions = <
  TData = Awaited<ReturnType<typeof getApiV1SendMessage>>,
  TError = ErrorType<void>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiV1SendMessage>>, TError, TData>>
}) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetApiV1SendMessageQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getApiV1SendMessage>>> = ({ signal }) =>
    getApiV1SendMessage({ signal })

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getApiV1SendMessage>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetApiV1SendMessageQueryResult = NonNullable<Awaited<ReturnType<typeof getApiV1SendMessage>>>
export type GetApiV1SendMessageQueryError = ErrorType<void>

export function useGetApiV1SendMessage<
  TData = Awaited<ReturnType<typeof getApiV1SendMessage>>,
  TError = ErrorType<void>,
>(
  options: {
    query: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiV1SendMessage>>, TError, TData>> &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiV1SendMessage>>,
          TError,
          Awaited<ReturnType<typeof getApiV1SendMessage>>
        >,
        'initialData'
      >
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiV1SendMessage<
  TData = Awaited<ReturnType<typeof getApiV1SendMessage>>,
  TError = ErrorType<void>,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiV1SendMessage>>, TError, TData>> &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiV1SendMessage>>,
          TError,
          Awaited<ReturnType<typeof getApiV1SendMessage>>
        >,
        'initialData'
      >
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiV1SendMessage<
  TData = Awaited<ReturnType<typeof getApiV1SendMessage>>,
  TError = ErrorType<void>,
>(
  options?: { query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiV1SendMessage>>, TError, TData>> },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Sends a message using the MessageSender service.
 */

export function useGetApiV1SendMessage<
  TData = Awaited<ReturnType<typeof getApiV1SendMessage>>,
  TError = ErrorType<void>,
>(
  options?: { query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiV1SendMessage>>, TError, TData>> },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getGetApiV1SendMessageQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>
  }

  return { ...query, queryKey: queryOptions.queryKey }
}
