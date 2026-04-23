//@ts-nocheck
import {
  useMutation,
  useQuery
} from '@tanstack/react-query';
import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  MutationFunction,
  QueryClient,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query';

import type {
  RedisCounter
} from '../../models';

import { customInstance } from '../../mutators/custom-instance';
import type { ErrorType } from '../../mutators/custom-instance';


type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];



/**
 * @summary Returns the current hit counter value.
 */
export type getCounterResponse200 = {
  data: RedisCounter
  status: 200
}

export type getCounterResponse500 = {
  data: void
  status: 500
}

export type getCounterResponseSuccess = (getCounterResponse200) & {
  headers: Headers;
};
export type getCounterResponseError = (getCounterResponse500) & {
  headers: Headers;
};

export type getCounterResponse = (getCounterResponseSuccess | getCounterResponseError)

export const getGetCounterUrl = () => {




  return `/api/v1/Redis/counter`
}

export const getCounter = async ( options?: RequestInit): Promise<getCounterResponse> => {

  return customInstance<getCounterResponse>(getGetCounterUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetCounterQueryKey = () => {
    return [
    `/api/v1/Redis/counter`
    ] as const;
    }


export const getGetCounterQueryOptions = <TData = Awaited<ReturnType<typeof getCounter>>, TError = ErrorType<void>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getCounter>>, TError, TData>>, request?: SecondParameter<typeof customInstance>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetCounterQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getCounter>>> = ({ signal }) => getCounter({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getCounter>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetCounterQueryResult = NonNullable<Awaited<ReturnType<typeof getCounter>>>
export type GetCounterQueryError = ErrorType<void>


export function useGetCounter<TData = Awaited<ReturnType<typeof getCounter>>, TError = ErrorType<void>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getCounter>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getCounter>>,
          TError,
          Awaited<ReturnType<typeof getCounter>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetCounter<TData = Awaited<ReturnType<typeof getCounter>>, TError = ErrorType<void>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getCounter>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getCounter>>,
          TError,
          Awaited<ReturnType<typeof getCounter>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetCounter<TData = Awaited<ReturnType<typeof getCounter>>, TError = ErrorType<void>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getCounter>>, TError, TData>>, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Returns the current hit counter value.
 */

export function useGetCounter<TData = Awaited<ReturnType<typeof getCounter>>, TError = ErrorType<void>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getCounter>>, TError, TData>>, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetCounterQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}






/**
 * @summary Increments the hit counter and returns the new value.
 */
export type incrementCounterResponse200 = {
  data: RedisCounter
  status: 200
}

export type incrementCounterResponse500 = {
  data: void
  status: 500
}

export type incrementCounterResponseSuccess = (incrementCounterResponse200) & {
  headers: Headers;
};
export type incrementCounterResponseError = (incrementCounterResponse500) & {
  headers: Headers;
};

export type incrementCounterResponse = (incrementCounterResponseSuccess | incrementCounterResponseError)

export const getIncrementCounterUrl = () => {




  return `/api/v1/Redis/counter`
}

export const incrementCounter = async ( options?: RequestInit): Promise<incrementCounterResponse> => {

  return customInstance<incrementCounterResponse>(getIncrementCounterUrl(),
  {
    ...options,
    method: 'POST'


  }
);}




export const getIncrementCounterMutationOptions = <TError = ErrorType<void>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof incrementCounter>>, TError,void, TContext>, request?: SecondParameter<typeof customInstance>}
): UseMutationOptions<Awaited<ReturnType<typeof incrementCounter>>, TError,void, TContext> => {

const mutationKey = ['incrementCounter'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof incrementCounter>>, void> = () => {


          return  incrementCounter(requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type IncrementCounterMutationResult = NonNullable<Awaited<ReturnType<typeof incrementCounter>>>

    export type IncrementCounterMutationError = ErrorType<void>

    /**
 * @summary Increments the hit counter and returns the new value.
 */
export const useIncrementCounter = <TError = ErrorType<void>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof incrementCounter>>, TError,void, TContext>, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof incrementCounter>>,
        TError,
        void,
        TContext
      > => {
      return useMutation(getIncrementCounterMutationOptions(options), queryClient);
    }
    /**
 * @summary Resets the hit counter to zero.
 */
export type resetCounterResponse200 = {
  data: RedisCounter
  status: 200
}

export type resetCounterResponse500 = {
  data: void
  status: 500
}

export type resetCounterResponseSuccess = (resetCounterResponse200) & {
  headers: Headers;
};
export type resetCounterResponseError = (resetCounterResponse500) & {
  headers: Headers;
};

export type resetCounterResponse = (resetCounterResponseSuccess | resetCounterResponseError)

export const getResetCounterUrl = () => {




  return `/api/v1/Redis/counter`
}

export const resetCounter = async ( options?: RequestInit): Promise<resetCounterResponse> => {

  return customInstance<resetCounterResponse>(getResetCounterUrl(),
  {
    ...options,
    method: 'DELETE'


  }
);}




export const getResetCounterMutationOptions = <TError = ErrorType<void>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof resetCounter>>, TError,void, TContext>, request?: SecondParameter<typeof customInstance>}
): UseMutationOptions<Awaited<ReturnType<typeof resetCounter>>, TError,void, TContext> => {

const mutationKey = ['resetCounter'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof resetCounter>>, void> = () => {


          return  resetCounter(requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type ResetCounterMutationResult = NonNullable<Awaited<ReturnType<typeof resetCounter>>>

    export type ResetCounterMutationError = ErrorType<void>

    /**
 * @summary Resets the hit counter to zero.
 */
export const useResetCounter = <TError = ErrorType<void>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof resetCounter>>, TError,void, TContext>, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof resetCounter>>,
        TError,
        void,
        TContext
      > => {
      return useMutation(getResetCounterMutationOptions(options), queryClient);
    }
