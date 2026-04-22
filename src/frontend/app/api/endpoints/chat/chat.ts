//@ts-nocheck
import {
  useMutation
} from '@tanstack/react-query';
import type {
  MutationFunction,
  QueryClient,
  UseMutationOptions,
  UseMutationResult
} from '@tanstack/react-query';

import type {
  ChatMessageRequest
} from '../../models';

import { customInstance } from '../../mutators/custom-instance';
import type { ErrorType } from '../../mutators/custom-instance';


type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];



/**
 * @summary Publishes a chat message. The author is taken from the JWT claims.
 */
export type postApiV1ChatMessagesResponse500 = {
  data: void
  status: 500
}

;
export type postApiV1ChatMessagesResponseError = (postApiV1ChatMessagesResponse500) & {
  headers: Headers;
};

export type postApiV1ChatMessagesResponse = (postApiV1ChatMessagesResponseError)

export const getPostApiV1ChatMessagesUrl = () => {




  return `/api/v1/Chat/messages`
}

export const postApiV1ChatMessages = async (chatMessageRequest: ChatMessageRequest, options?: RequestInit): Promise<postApiV1ChatMessagesResponse> => {

  return customInstance<postApiV1ChatMessagesResponse>(getPostApiV1ChatMessagesUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      chatMessageRequest,)
  }
);}




export const getPostApiV1ChatMessagesMutationOptions = <TError = ErrorType<void>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof postApiV1ChatMessages>>, TError,{data: ChatMessageRequest}, TContext>, request?: SecondParameter<typeof customInstance>}
): UseMutationOptions<Awaited<ReturnType<typeof postApiV1ChatMessages>>, TError,{data: ChatMessageRequest}, TContext> => {

const mutationKey = ['postApiV1ChatMessages'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof postApiV1ChatMessages>>, {data: ChatMessageRequest}> = (props) => {
          const {data} = props ?? {};

          return  postApiV1ChatMessages(data,requestOptions)
        }




  return  { mutationFn, ...mutationOptions }}

    export type PostApiV1ChatMessagesMutationResult = NonNullable<Awaited<ReturnType<typeof postApiV1ChatMessages>>>
    export type PostApiV1ChatMessagesMutationBody = ChatMessageRequest
    export type PostApiV1ChatMessagesMutationError = ErrorType<void>

    /**
 * @summary Publishes a chat message. The author is taken from the JWT claims.
 */
export const usePostApiV1ChatMessages = <TError = ErrorType<void>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof postApiV1ChatMessages>>, TError,{data: ChatMessageRequest}, TContext>, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof postApiV1ChatMessages>>,
        TError,
        {data: ChatMessageRequest},
        TContext
      > => {
      return useMutation(getPostApiV1ChatMessagesMutationOptions(options), queryClient);
    }
