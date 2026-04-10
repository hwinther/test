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
  BlogDto,
  PostDto
} from '../../models';

import { customInstance } from '../../mutators/custom-instance';
import type { ErrorType } from '../../mutators/custom-instance';




/**
 * @summary Gets a list of all blogs.
 */
export type getBlogsResponse200 = {
  data: BlogDto[]
  status: 200
}

export type getBlogsResponse500 = {
  data: void
  status: 500
}

export type getBlogsResponseSuccess = (getBlogsResponse200) & {
  headers: Headers;
};
export type getBlogsResponseError = (getBlogsResponse500) & {
  headers: Headers;
};

export type getBlogsResponse = (getBlogsResponseSuccess | getBlogsResponseError)

export const getGetBlogsUrl = () => {




  return `/api/v1/Blogging/blog`
}

export const getBlogs = async ( options?: RequestInit): Promise<getBlogsResponse> => {

  return customInstance<getBlogsResponse>(getGetBlogsUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetBlogsQueryKey = () => {
    return [
    `/api/v1/Blogging/blog`
    ] as const;
    }


export const getGetBlogsQueryOptions = <TData = Awaited<ReturnType<typeof getBlogs>>, TError = ErrorType<void>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getBlogs>>, TError, TData>>, }
) => {

const {query: queryOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetBlogsQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getBlogs>>> = ({ signal }) => getBlogs({ signal });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getBlogs>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetBlogsQueryResult = NonNullable<Awaited<ReturnType<typeof getBlogs>>>
export type GetBlogsQueryError = ErrorType<void>


export function useGetBlogs<TData = Awaited<ReturnType<typeof getBlogs>>, TError = ErrorType<void>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getBlogs>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getBlogs>>,
          TError,
          Awaited<ReturnType<typeof getBlogs>>
        > , 'initialData'
      >, }
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetBlogs<TData = Awaited<ReturnType<typeof getBlogs>>, TError = ErrorType<void>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getBlogs>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getBlogs>>,
          TError,
          Awaited<ReturnType<typeof getBlogs>>
        > , 'initialData'
      >, }
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetBlogs<TData = Awaited<ReturnType<typeof getBlogs>>, TError = ErrorType<void>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getBlogs>>, TError, TData>>, }
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Gets a list of all blogs.
 */

export function useGetBlogs<TData = Awaited<ReturnType<typeof getBlogs>>, TError = ErrorType<void>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getBlogs>>, TError, TData>>, }
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetBlogsQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}






/**
 * @summary Creates a new blog or updates an existing one.
 */
export type postBlogResponse200 = {
  data: BlogDto
  status: 200
}

export type postBlogResponse404 = {
  data: void
  status: 404
}

export type postBlogResponse500 = {
  data: void
  status: 500
}

export type postBlogResponseSuccess = (postBlogResponse200) & {
  headers: Headers;
};
export type postBlogResponseError = (postBlogResponse404 | postBlogResponse500) & {
  headers: Headers;
};

export type postBlogResponse = (postBlogResponseSuccess | postBlogResponseError)

export const getPostBlogUrl = () => {




  return `/api/v1/Blogging/blog`
}

export const postBlog = async (blogDto: BlogDto, options?: RequestInit): Promise<postBlogResponse> => {

  return customInstance<postBlogResponse>(getPostBlogUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      blogDto,)
  }
);}




export const getPostBlogMutationOptions = <TError = ErrorType<void>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof postBlog>>, TError,{data: BlogDto}, TContext>, }
): UseMutationOptions<Awaited<ReturnType<typeof postBlog>>, TError,{data: BlogDto}, TContext> => {

const mutationKey = ['postBlog'];
const {mutation: mutationOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof postBlog>>, {data: BlogDto}> = (props) => {
          const {data} = props ?? {};

          return  postBlog(data,)
        }






  return  { mutationFn, ...mutationOptions }}

    export type PostBlogMutationResult = NonNullable<Awaited<ReturnType<typeof postBlog>>>
    export type PostBlogMutationBody = BlogDto
    export type PostBlogMutationError = ErrorType<void>

    /**
 * @summary Creates a new blog or updates an existing one.
 */
export const usePostBlog = <TError = ErrorType<void>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof postBlog>>, TError,{data: BlogDto}, TContext>, }
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof postBlog>>,
        TError,
        {data: BlogDto},
        TContext
      > => {
      return useMutation(getPostBlogMutationOptions(options), queryClient);
    }
    /**
 * @summary Gets a specific blog by ID.
 */
export type getBlogResponse200 = {
  data: BlogDto
  status: 200
}

export type getBlogResponse404 = {
  data: void
  status: 404
}

export type getBlogResponse500 = {
  data: void
  status: 500
}

export type getBlogResponseSuccess = (getBlogResponse200) & {
  headers: Headers;
};
export type getBlogResponseError = (getBlogResponse404 | getBlogResponse500) & {
  headers: Headers;
};

export type getBlogResponse = (getBlogResponseSuccess | getBlogResponseError)

export const getGetBlogUrl = (id: number,) => {




  return `/api/v1/Blogging/blog/${id}`
}

export const getBlog = async (id: number, options?: RequestInit): Promise<getBlogResponse> => {

  return customInstance<getBlogResponse>(getGetBlogUrl(id),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetBlogQueryKey = (id: number,) => {
    return [
    `/api/v1/Blogging/blog/${id}`
    ] as const;
    }


export const getGetBlogQueryOptions = <TData = Awaited<ReturnType<typeof getBlog>>, TError = ErrorType<void>>(id: number, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getBlog>>, TError, TData>>, }
) => {

const {query: queryOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetBlogQueryKey(id);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getBlog>>> = ({ signal }) => getBlog(id, { signal });





   return  { queryKey, queryFn, enabled: !!(id), ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getBlog>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetBlogQueryResult = NonNullable<Awaited<ReturnType<typeof getBlog>>>
export type GetBlogQueryError = ErrorType<void>


export function useGetBlog<TData = Awaited<ReturnType<typeof getBlog>>, TError = ErrorType<void>>(
 id: number, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getBlog>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getBlog>>,
          TError,
          Awaited<ReturnType<typeof getBlog>>
        > , 'initialData'
      >, }
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetBlog<TData = Awaited<ReturnType<typeof getBlog>>, TError = ErrorType<void>>(
 id: number, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getBlog>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getBlog>>,
          TError,
          Awaited<ReturnType<typeof getBlog>>
        > , 'initialData'
      >, }
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetBlog<TData = Awaited<ReturnType<typeof getBlog>>, TError = ErrorType<void>>(
 id: number, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getBlog>>, TError, TData>>, }
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Gets a specific blog by ID.
 */

export function useGetBlog<TData = Awaited<ReturnType<typeof getBlog>>, TError = ErrorType<void>>(
 id: number, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getBlog>>, TError, TData>>, }
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetBlogQueryOptions(id,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}






/**
 * @summary Gets a list of posts related to a specific blog.
 */
export type getPostsResponse200 = {
  data: PostDto[]
  status: 200
}

export type getPostsResponse500 = {
  data: void
  status: 500
}

export type getPostsResponseSuccess = (getPostsResponse200) & {
  headers: Headers;
};
export type getPostsResponseError = (getPostsResponse500) & {
  headers: Headers;
};

export type getPostsResponse = (getPostsResponseSuccess | getPostsResponseError)

export const getGetPostsUrl = (blogId: number,) => {




  return `/api/v1/Blogging/blog/${blogId}/posts`
}

export const getPosts = async (blogId: number, options?: RequestInit): Promise<getPostsResponse> => {

  return customInstance<getPostsResponse>(getGetPostsUrl(blogId),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetPostsQueryKey = (blogId: number,) => {
    return [
    `/api/v1/Blogging/blog/${blogId}/posts`
    ] as const;
    }


export const getGetPostsQueryOptions = <TData = Awaited<ReturnType<typeof getPosts>>, TError = ErrorType<void>>(blogId: number, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getPosts>>, TError, TData>>, }
) => {

const {query: queryOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetPostsQueryKey(blogId);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getPosts>>> = ({ signal }) => getPosts(blogId, { signal });





   return  { queryKey, queryFn, enabled: !!(blogId), ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getPosts>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetPostsQueryResult = NonNullable<Awaited<ReturnType<typeof getPosts>>>
export type GetPostsQueryError = ErrorType<void>


export function useGetPosts<TData = Awaited<ReturnType<typeof getPosts>>, TError = ErrorType<void>>(
 blogId: number, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getPosts>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getPosts>>,
          TError,
          Awaited<ReturnType<typeof getPosts>>
        > , 'initialData'
      >, }
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetPosts<TData = Awaited<ReturnType<typeof getPosts>>, TError = ErrorType<void>>(
 blogId: number, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getPosts>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getPosts>>,
          TError,
          Awaited<ReturnType<typeof getPosts>>
        > , 'initialData'
      >, }
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetPosts<TData = Awaited<ReturnType<typeof getPosts>>, TError = ErrorType<void>>(
 blogId: number, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getPosts>>, TError, TData>>, }
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Gets a list of posts related to a specific blog.
 */

export function useGetPosts<TData = Awaited<ReturnType<typeof getPosts>>, TError = ErrorType<void>>(
 blogId: number, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getPosts>>, TError, TData>>, }
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetPostsQueryOptions(blogId,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}






/**
 * @summary Gets a specific post by ID.
 */
export type getPostResponse200 = {
  data: PostDto
  status: 200
}

export type getPostResponse404 = {
  data: void
  status: 404
}

export type getPostResponse500 = {
  data: void
  status: 500
}

export type getPostResponseSuccess = (getPostResponse200) & {
  headers: Headers;
};
export type getPostResponseError = (getPostResponse404 | getPostResponse500) & {
  headers: Headers;
};

export type getPostResponse = (getPostResponseSuccess | getPostResponseError)

export const getGetPostUrl = (id: number,) => {




  return `/api/v1/Blogging/post/${id}`
}

export const getPost = async (id: number, options?: RequestInit): Promise<getPostResponse> => {

  return customInstance<getPostResponse>(getGetPostUrl(id),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetPostQueryKey = (id: number,) => {
    return [
    `/api/v1/Blogging/post/${id}`
    ] as const;
    }


export const getGetPostQueryOptions = <TData = Awaited<ReturnType<typeof getPost>>, TError = ErrorType<void>>(id: number, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getPost>>, TError, TData>>, }
) => {

const {query: queryOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetPostQueryKey(id);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getPost>>> = ({ signal }) => getPost(id, { signal });





   return  { queryKey, queryFn, enabled: !!(id), ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getPost>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetPostQueryResult = NonNullable<Awaited<ReturnType<typeof getPost>>>
export type GetPostQueryError = ErrorType<void>


export function useGetPost<TData = Awaited<ReturnType<typeof getPost>>, TError = ErrorType<void>>(
 id: number, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getPost>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getPost>>,
          TError,
          Awaited<ReturnType<typeof getPost>>
        > , 'initialData'
      >, }
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetPost<TData = Awaited<ReturnType<typeof getPost>>, TError = ErrorType<void>>(
 id: number, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getPost>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getPost>>,
          TError,
          Awaited<ReturnType<typeof getPost>>
        > , 'initialData'
      >, }
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetPost<TData = Awaited<ReturnType<typeof getPost>>, TError = ErrorType<void>>(
 id: number, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getPost>>, TError, TData>>, }
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Gets a specific post by ID.
 */

export function useGetPost<TData = Awaited<ReturnType<typeof getPost>>, TError = ErrorType<void>>(
 id: number, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getPost>>, TError, TData>>, }
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetPostQueryOptions(id,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}






/**
 * @summary Creates a new post.
 */
export type postPostResponse200 = {
  data: PostDto
  status: 200
}

export type postPostResponse404 = {
  data: void
  status: 404
}

export type postPostResponse500 = {
  data: void
  status: 500
}

export type postPostResponseSuccess = (postPostResponse200) & {
  headers: Headers;
};
export type postPostResponseError = (postPostResponse404 | postPostResponse500) & {
  headers: Headers;
};

export type postPostResponse = (postPostResponseSuccess | postPostResponseError)

export const getPostPostUrl = () => {




  return `/api/v1/Blogging/post`
}

export const postPost = async (postDto: PostDto, options?: RequestInit): Promise<postPostResponse> => {

  return customInstance<postPostResponse>(getPostPostUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      postDto,)
  }
);}




export const getPostPostMutationOptions = <TError = ErrorType<void>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof postPost>>, TError,{data: PostDto}, TContext>, }
): UseMutationOptions<Awaited<ReturnType<typeof postPost>>, TError,{data: PostDto}, TContext> => {

const mutationKey = ['postPost'];
const {mutation: mutationOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof postPost>>, {data: PostDto}> = (props) => {
          const {data} = props ?? {};

          return  postPost(data,)
        }






  return  { mutationFn, ...mutationOptions }}

    export type PostPostMutationResult = NonNullable<Awaited<ReturnType<typeof postPost>>>
    export type PostPostMutationBody = PostDto
    export type PostPostMutationError = ErrorType<void>

    /**
 * @summary Creates a new post.
 */
export const usePostPost = <TError = ErrorType<void>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof postPost>>, TError,{data: PostDto}, TContext>, }
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof postPost>>,
        TError,
        {data: PostDto},
        TContext
      > => {
      return useMutation(getPostPostMutationOptions(options), queryClient);
    }
