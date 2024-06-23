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
import type { BlogDto, PostDto } from '../../models'
import { customInstance } from '../../mutators/custom-instance'
import type { ErrorType } from '../../mutators/custom-instance'

/**
 * @summary Gets a list of all blogs.
 */
export const getBlogs = (signal?: AbortSignal) => {
  return customInstance<BlogDto[]>({ url: `/Blogging/blog`, method: 'GET', signal })
}

export const getGetBlogsQueryKey = () => {
  return [`/Blogging/blog`] as const
}

export const getGetBlogsQueryOptions = <
  TData = Awaited<ReturnType<typeof getBlogs>>,
  TError = ErrorType<void>,
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
export type GetBlogsQueryError = ErrorType<void>

/**
 * @summary Gets a list of all blogs.
 */
export const useGetBlogs = <TData = Awaited<ReturnType<typeof getBlogs>>, TError = ErrorType<void>>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getBlogs>>, TError, TData>>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetBlogsQueryOptions(options)

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryOptions.queryKey

  return query
}

/**
 * @summary Creates a new blog or updates an existing one.
 */
export const postBlog = (blogDto: BlogDto) => {
  return customInstance<BlogDto>({
    url: `/Blogging/blog`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: blogDto,
  })
}

export const getPostBlogMutationOptions = <TError = ErrorType<void>, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof postBlog>>, TError, { data: BlogDto }, TContext>
}): UseMutationOptions<Awaited<ReturnType<typeof postBlog>>, TError, { data: BlogDto }, TContext> => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof postBlog>>, { data: BlogDto }> = (props) => {
    const { data } = props ?? {}

    return postBlog(data)
  }

  return { mutationFn, ...mutationOptions }
}

export type PostBlogMutationResult = NonNullable<Awaited<ReturnType<typeof postBlog>>>
export type PostBlogMutationBody = BlogDto
export type PostBlogMutationError = ErrorType<void>

/**
 * @summary Creates a new blog or updates an existing one.
 */
export const usePostBlog = <TError = ErrorType<void>, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof postBlog>>, TError, { data: BlogDto }, TContext>
}): UseMutationResult<Awaited<ReturnType<typeof postBlog>>, TError, { data: BlogDto }, TContext> => {
  const mutationOptions = getPostBlogMutationOptions(options)

  return useMutation(mutationOptions)
}
/**
 * @summary Gets a specific blog by ID.
 */
export const getBlog = (id: number, signal?: AbortSignal) => {
  return customInstance<BlogDto>({ url: `/Blogging/blog/${id}`, method: 'GET', signal })
}

export const getGetBlogQueryKey = (id: number) => {
  return [`/Blogging/blog/${id}`] as const
}

export const getGetBlogQueryOptions = <TData = Awaited<ReturnType<typeof getBlog>>, TError = ErrorType<void>>(
  id: number,
  options?: { query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getBlog>>, TError, TData>> },
) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetBlogQueryKey(id)

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getBlog>>> = ({ signal }) => getBlog(id, signal)

  return { queryKey, queryFn, enabled: !!id, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getBlog>>,
    TError,
    TData
  > & { queryKey: QueryKey }
}

export type GetBlogQueryResult = NonNullable<Awaited<ReturnType<typeof getBlog>>>
export type GetBlogQueryError = ErrorType<void>

/**
 * @summary Gets a specific blog by ID.
 */
export const useGetBlog = <TData = Awaited<ReturnType<typeof getBlog>>, TError = ErrorType<void>>(
  id: number,
  options?: { query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getBlog>>, TError, TData>> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetBlogQueryOptions(id, options)

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryOptions.queryKey

  return query
}

/**
 * @summary Gets a list of posts related to a specific blog.
 */
export const getPosts = (blogId: number, signal?: AbortSignal) => {
  return customInstance<PostDto[]>({ url: `/Blogging/blog/${blogId}/posts`, method: 'GET', signal })
}

export const getGetPostsQueryKey = (blogId: number) => {
  return [`/Blogging/blog/${blogId}/posts`] as const
}

export const getGetPostsQueryOptions = <TData = Awaited<ReturnType<typeof getPosts>>, TError = ErrorType<void>>(
  blogId: number,
  options?: { query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getPosts>>, TError, TData>> },
) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetPostsQueryKey(blogId)

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getPosts>>> = ({ signal }) => getPosts(blogId, signal)

  return { queryKey, queryFn, enabled: !!blogId, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getPosts>>,
    TError,
    TData
  > & { queryKey: QueryKey }
}

export type GetPostsQueryResult = NonNullable<Awaited<ReturnType<typeof getPosts>>>
export type GetPostsQueryError = ErrorType<void>

/**
 * @summary Gets a list of posts related to a specific blog.
 */
export const useGetPosts = <TData = Awaited<ReturnType<typeof getPosts>>, TError = ErrorType<void>>(
  blogId: number,
  options?: { query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getPosts>>, TError, TData>> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetPostsQueryOptions(blogId, options)

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryOptions.queryKey

  return query
}

/**
 * @summary Gets a specific post by ID.
 */
export const getPost = (id: number, signal?: AbortSignal) => {
  return customInstance<PostDto>({ url: `/Blogging/post/${id}`, method: 'GET', signal })
}

export const getGetPostQueryKey = (id: number) => {
  return [`/Blogging/post/${id}`] as const
}

export const getGetPostQueryOptions = <TData = Awaited<ReturnType<typeof getPost>>, TError = ErrorType<void>>(
  id: number,
  options?: { query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getPost>>, TError, TData>> },
) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetPostQueryKey(id)

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getPost>>> = ({ signal }) => getPost(id, signal)

  return { queryKey, queryFn, enabled: !!id, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getPost>>,
    TError,
    TData
  > & { queryKey: QueryKey }
}

export type GetPostQueryResult = NonNullable<Awaited<ReturnType<typeof getPost>>>
export type GetPostQueryError = ErrorType<void>

/**
 * @summary Gets a specific post by ID.
 */
export const useGetPost = <TData = Awaited<ReturnType<typeof getPost>>, TError = ErrorType<void>>(
  id: number,
  options?: { query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getPost>>, TError, TData>> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetPostQueryOptions(id, options)

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryOptions.queryKey

  return query
}

/**
 * @summary Creates a new post.
 */
export const postPost = (postDto: PostDto) => {
  return customInstance<PostDto>({
    url: `/Blogging/post`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: postDto,
  })
}

export const getPostPostMutationOptions = <TError = ErrorType<void>, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof postPost>>, TError, { data: PostDto }, TContext>
}): UseMutationOptions<Awaited<ReturnType<typeof postPost>>, TError, { data: PostDto }, TContext> => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof postPost>>, { data: PostDto }> = (props) => {
    const { data } = props ?? {}

    return postPost(data)
  }

  return { mutationFn, ...mutationOptions }
}

export type PostPostMutationResult = NonNullable<Awaited<ReturnType<typeof postPost>>>
export type PostPostMutationBody = PostDto
export type PostPostMutationError = ErrorType<void>

/**
 * @summary Creates a new post.
 */
export const usePostPost = <TError = ErrorType<void>, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof postPost>>, TError, { data: PostDto }, TContext>
}): UseMutationResult<Awaited<ReturnType<typeof postPost>>, TError, { data: PostDto }, TContext> => {
  const mutationOptions = getPostPostMutationOptions(options)

  return useMutation(mutationOptions)
}
