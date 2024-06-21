//@ts-nocheck
import { useMutation, useQuery } from '@tanstack/react-query'
import type {
  MutationFunction,
  QueryFunction,
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query'
import type { Blog, Post } from '../../models'
import { customInstance } from '../../mutators/custom-instance'
import type { ErrorType } from '../../mutators/custom-instance'

// https://stackoverflow.com/questions/49579094/typescript-conditional-types-filter-out-readonly-properties-pick-only-requir/49579497#49579497
type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B

type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
}[keyof T]

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never
type DistributeReadOnlyOverUnions<T> = T extends any ? NonReadonly<T> : never

type Writable<T> = Pick<T, WritableKeys<T>>
type NonReadonly<T> = [T] extends [UnionToIntersection<T>]
  ? {
      [P in keyof Writable<T>]: T[P] extends object ? NonReadonly<NonNullable<T[P]>> : T[P]
    }
  : DistributeReadOnlyOverUnions<T>

/**
 * @summary Get blogs
 */
export const getBlogs = (signal?: AbortSignal) => {
  return customInstance<Blog[]>({ url: `/Blogging/Blog`, method: 'GET', signal })
}

export const getGetBlogsQueryKey = () => {
  return [`/Blogging/Blog`] as const
}

export const getGetBlogsQueryOptions = <
  TData = Awaited<ReturnType<typeof getBlogs>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getBlogs>>, TError, TData>>
}) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetBlogsQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getBlogs>>> = ({ signal }) => getBlogs(signal)

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getBlogs>>,
    TError,
    TData
  > & { queryKey: QueryKey }
}

export type GetBlogsQueryResult = NonNullable<Awaited<ReturnType<typeof getBlogs>>>
export type GetBlogsQueryError = ErrorType<unknown>

/**
 * @summary Get blogs
 */
export const useGetBlogs = <TData = Awaited<ReturnType<typeof getBlogs>>, TError = ErrorType<unknown>>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getBlogs>>, TError, TData>>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetBlogsQueryOptions(options)

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryOptions.queryKey

  return query
}

/**
 * @summary Create blog
 */
export const postBlog = (blog: NonReadonly<Blog>) => {
  return customInstance<Blog>({
    url: `/Blogging/Blog`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: blog,
  })
}

export const getPostBlogMutationOptions = <TError = ErrorType<unknown>, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof postBlog>>, TError, { data: NonReadonly<Blog> }, TContext>
}): UseMutationOptions<Awaited<ReturnType<typeof postBlog>>, TError, { data: NonReadonly<Blog> }, TContext> => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof postBlog>>, { data: NonReadonly<Blog> }> = (props) => {
    const { data } = props ?? {}

    return postBlog(data)
  }

  return { mutationFn, ...mutationOptions }
}

export type PostBlogMutationResult = NonNullable<Awaited<ReturnType<typeof postBlog>>>
export type PostBlogMutationBody = NonReadonly<Blog>
export type PostBlogMutationError = ErrorType<unknown>

/**
 * @summary Create blog
 */
export const usePostBlog = <TError = ErrorType<unknown>, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof postBlog>>, TError, { data: NonReadonly<Blog> }, TContext>
}): UseMutationResult<Awaited<ReturnType<typeof postBlog>>, TError, { data: NonReadonly<Blog> }, TContext> => {
  const mutationOptions = getPostBlogMutationOptions(options)

  return useMutation(mutationOptions)
}
/**
 * @summary Get posts
 */
export const getPosts = (signal?: AbortSignal) => {
  return customInstance<Post[]>({ url: `/Blogging/Post`, method: 'GET', signal })
}

export const getGetPostsQueryKey = () => {
  return [`/Blogging/Post`] as const
}

export const getGetPostsQueryOptions = <
  TData = Awaited<ReturnType<typeof getPosts>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getPosts>>, TError, TData>>
}) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetPostsQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getPosts>>> = ({ signal }) => getPosts(signal)

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getPosts>>,
    TError,
    TData
  > & { queryKey: QueryKey }
}

export type GetPostsQueryResult = NonNullable<Awaited<ReturnType<typeof getPosts>>>
export type GetPostsQueryError = ErrorType<unknown>

/**
 * @summary Get posts
 */
export const useGetPosts = <TData = Awaited<ReturnType<typeof getPosts>>, TError = ErrorType<unknown>>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getPosts>>, TError, TData>>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetPostsQueryOptions(options)

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryOptions.queryKey

  return query
}

/**
 * @summary Create post
 */
export const postPost = (post: Post) => {
  return customInstance<Post>({
    url: `/Blogging/Post`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: post,
  })
}

export const getPostPostMutationOptions = <TError = ErrorType<unknown>, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof postPost>>, TError, { data: Post }, TContext>
}): UseMutationOptions<Awaited<ReturnType<typeof postPost>>, TError, { data: Post }, TContext> => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof postPost>>, { data: Post }> = (props) => {
    const { data } = props ?? {}

    return postPost(data)
  }

  return { mutationFn, ...mutationOptions }
}

export type PostPostMutationResult = NonNullable<Awaited<ReturnType<typeof postPost>>>
export type PostPostMutationBody = Post
export type PostPostMutationError = ErrorType<unknown>

/**
 * @summary Create post
 */
export const usePostPost = <TError = ErrorType<unknown>, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof postPost>>, TError, { data: Post }, TContext>
}): UseMutationResult<Awaited<ReturnType<typeof postPost>>, TError, { data: Post }, TContext> => {
  const mutationOptions = getPostPostMutationOptions(options)

  return useMutation(mutationOptions)
}
