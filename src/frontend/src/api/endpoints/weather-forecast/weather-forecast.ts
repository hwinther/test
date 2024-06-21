import type { QueryFunction, QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'

import { useQuery } from '@tanstack/react-query'

import type { WeatherForecast } from '../../models'
import type { ErrorType } from '../../mutators/custom-instance'

import { customInstance } from '../../mutators/custom-instance'

/**
 * @param signal
 * @summary Returns weather forecast
 */
export const getWeatherForecast = async (signal?: AbortSignal) => {
  return await customInstance<WeatherForecast[]>({
    method: 'GET',
    signal,
    url: `/WeatherForecast`,
  })
}

export const getGetWeatherForecastQueryKey = () => {
  return [`/WeatherForecast`] as const
}

export const getGetWeatherForecastQueryOptions = <
  TData = Awaited<ReturnType<typeof getWeatherForecast>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getWeatherForecast>>, TError, TData>>
}) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetWeatherForecastQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getWeatherForecast>>> = async ({ signal }) =>
    await getWeatherForecast(signal)

  return { queryFn, queryKey, ...queryOptions } as { queryKey: QueryKey } & UseQueryOptions<
    Awaited<ReturnType<typeof getWeatherForecast>>,
    TError,
    TData
  >
}

export type GetWeatherForecastQueryResult = NonNullable<Awaited<ReturnType<typeof getWeatherForecast>>>
export type GetWeatherForecastQueryError = ErrorType<unknown>

/**
 * @param options
 * @param options.query
 * @summary Returns weather forecast
 */
export const useGetWeatherForecast = <
  TData = Awaited<ReturnType<typeof getWeatherForecast>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getWeatherForecast>>, TError, TData>>
}): { queryKey: QueryKey } & UseQueryResult<TData, TError> => {
  const queryOptions = getGetWeatherForecastQueryOptions(options)

  const query = useQuery(queryOptions) as {
    queryKey: QueryKey
  } & UseQueryResult<TData, TError>

  query.queryKey = queryOptions.queryKey

  return query
}
