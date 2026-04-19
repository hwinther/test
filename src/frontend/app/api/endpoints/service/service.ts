//@ts-nocheck
import {
  useQuery
} from '@tanstack/react-query';
import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  QueryClient,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query';

import type {
  StringGenericValue,
  VersionInformation
} from '../../models';

import { customInstance } from '../../mutators/custom-instance';
import type { ErrorType } from '../../mutators/custom-instance';


type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];



/**
 * @summary Returns ok
 */
export type pingResponse200 = {
  data: StringGenericValue
  status: 200
}

export type pingResponse500 = {
  data: void
  status: 500
}

export type pingResponseSuccess = (pingResponse200) & {
  headers: Headers;
};
export type pingResponseError = (pingResponse500) & {
  headers: Headers;
};

export type pingResponse = (pingResponseSuccess | pingResponseError)

export const getPingUrl = () => {




  return `/api/v1/Service/ping`
}

export const ping = async ( options?: RequestInit): Promise<pingResponse> => {

  return customInstance<pingResponse>(getPingUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getPingQueryKey = () => {
    return [
    `/api/v1/Service/ping`
    ] as const;
    }


export const getPingQueryOptions = <TData = Awaited<ReturnType<typeof ping>>, TError = ErrorType<void>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof ping>>, TError, TData>>, request?: SecondParameter<typeof customInstance>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getPingQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof ping>>> = ({ signal }) => ping({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof ping>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type PingQueryResult = NonNullable<Awaited<ReturnType<typeof ping>>>
export type PingQueryError = ErrorType<void>


export function usePing<TData = Awaited<ReturnType<typeof ping>>, TError = ErrorType<void>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof ping>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof ping>>,
          TError,
          Awaited<ReturnType<typeof ping>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function usePing<TData = Awaited<ReturnType<typeof ping>>, TError = ErrorType<void>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof ping>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof ping>>,
          TError,
          Awaited<ReturnType<typeof ping>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function usePing<TData = Awaited<ReturnType<typeof ping>>, TError = ErrorType<void>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof ping>>, TError, TData>>, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Returns ok
 */

export function usePing<TData = Awaited<ReturnType<typeof ping>>, TError = ErrorType<void>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof ping>>, TError, TData>>, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getPingQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}






/**
 * @summary Returns version
 */
export type versionResponse200 = {
  data: VersionInformation
  status: 200
}

export type versionResponse500 = {
  data: void
  status: 500
}

export type versionResponseSuccess = (versionResponse200) & {
  headers: Headers;
};
export type versionResponseError = (versionResponse500) & {
  headers: Headers;
};

export type versionResponse = (versionResponseSuccess | versionResponseError)

export const getVersionUrl = () => {




  return `/api/v1/Service/version`
}

export const version = async ( options?: RequestInit): Promise<versionResponse> => {

  return customInstance<versionResponse>(getVersionUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getVersionQueryKey = () => {
    return [
    `/api/v1/Service/version`
    ] as const;
    }


export const getVersionQueryOptions = <TData = Awaited<ReturnType<typeof version>>, TError = ErrorType<void>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof version>>, TError, TData>>, request?: SecondParameter<typeof customInstance>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getVersionQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof version>>> = ({ signal }) => version({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof version>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type VersionQueryResult = NonNullable<Awaited<ReturnType<typeof version>>>
export type VersionQueryError = ErrorType<void>


export function useVersion<TData = Awaited<ReturnType<typeof version>>, TError = ErrorType<void>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof version>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof version>>,
          TError,
          Awaited<ReturnType<typeof version>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useVersion<TData = Awaited<ReturnType<typeof version>>, TError = ErrorType<void>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof version>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof version>>,
          TError,
          Awaited<ReturnType<typeof version>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useVersion<TData = Awaited<ReturnType<typeof version>>, TError = ErrorType<void>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof version>>, TError, TData>>, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Returns version
 */

export function useVersion<TData = Awaited<ReturnType<typeof version>>, TError = ErrorType<void>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof version>>, TError, TData>>, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getVersionQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}






