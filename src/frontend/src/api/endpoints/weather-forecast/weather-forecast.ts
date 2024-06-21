//@ts-nocheck
import { useQuery } from '@tanstack/react-query'
import type { QueryFunction, QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import type { WeatherForecast } from '../../models'
import { customInstance } from '../../mutators/custom-instance'
import type { ErrorType } from '../../mutators/custom-instance'

/**
 * @summary Returns weather forecast
 */
export const getWeatherForecast = (signal?: AbortSignal) => {
  return customInstance<WeatherForecast[]>({ url: `/WeatherForecast`, method: 'GET', signal })
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

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getWeatherForecast>>> = ({ signal }) =>
    getWeatherForecast(signal)

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getWeatherForecast>>,
    TError,
    TData
  > & { queryKey: QueryKey }
}

export type GetWeatherForecastQueryResult = NonNullable<Awaited<ReturnType<typeof getWeatherForecast>>>
export type GetWeatherForecastQueryError = ErrorType<unknown>

/**
 * @summary Returns weather forecast
 */
export const useGetWeatherForecast = <
  TData = Awaited<ReturnType<typeof getWeatherForecast>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getWeatherForecast>>, TError, TData>>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetWeatherForecastQueryOptions(options)

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryOptions.queryKey

  return query
}
