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

import type { WeatherForecast } from '../../models'

import { customInstance } from '../../mutators/custom-instance'
import type { ErrorType } from '../../mutators/custom-instance'

/**
 * @summary Returns weather forecast
 */
export type getWeatherForecastResponse200 = {
  data: WeatherForecast[]
  status: 200
}

export type getWeatherForecastResponse500 = {
  data: void
  status: 500
}

export type getWeatherForecastResponseSuccess = getWeatherForecastResponse200 & {
  headers: Headers
}
export type getWeatherForecastResponseError = getWeatherForecastResponse500 & {
  headers: Headers
}

export type getWeatherForecastResponse = getWeatherForecastResponseSuccess | getWeatherForecastResponseError

export const getGetWeatherForecastUrl = () => {
  return `/api/v1/WeatherForecast`
}

export const getWeatherForecast = async (options?: RequestInit): Promise<getWeatherForecastResponse> => {
  return customInstance<getWeatherForecastResponse>(getGetWeatherForecastUrl(), {
    ...options,
    method: 'GET',
  })
}

export const getGetWeatherForecastQueryKey = () => {
  return [`/api/v1/WeatherForecast`] as const
}

export const getGetWeatherForecastQueryOptions = <
  TData = Awaited<ReturnType<typeof getWeatherForecast>>,
  TError = ErrorType<void>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getWeatherForecast>>, TError, TData>>
}) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetWeatherForecastQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getWeatherForecast>>> = ({ signal }) =>
    getWeatherForecast({ signal })

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getWeatherForecast>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetWeatherForecastQueryResult = NonNullable<Awaited<ReturnType<typeof getWeatherForecast>>>
export type GetWeatherForecastQueryError = ErrorType<void>

export function useGetWeatherForecast<TData = Awaited<ReturnType<typeof getWeatherForecast>>, TError = ErrorType<void>>(
  options: {
    query: Partial<UseQueryOptions<Awaited<ReturnType<typeof getWeatherForecast>>, TError, TData>> &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getWeatherForecast>>,
          TError,
          Awaited<ReturnType<typeof getWeatherForecast>>
        >,
        'initialData'
      >
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetWeatherForecast<TData = Awaited<ReturnType<typeof getWeatherForecast>>, TError = ErrorType<void>>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getWeatherForecast>>, TError, TData>> &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getWeatherForecast>>,
          TError,
          Awaited<ReturnType<typeof getWeatherForecast>>
        >,
        'initialData'
      >
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetWeatherForecast<TData = Awaited<ReturnType<typeof getWeatherForecast>>, TError = ErrorType<void>>(
  options?: { query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getWeatherForecast>>, TError, TData>> },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Returns weather forecast
 */

export function useGetWeatherForecast<TData = Awaited<ReturnType<typeof getWeatherForecast>>, TError = ErrorType<void>>(
  options?: { query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getWeatherForecast>>, TError, TData>> },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getGetWeatherForecastQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>
  }

  return { ...query, queryKey: queryOptions.queryKey }
}
