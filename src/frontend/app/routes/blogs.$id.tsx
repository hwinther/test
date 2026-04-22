import React, { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { useAuth } from 'react-oidc-context'

import { useGetBlog, useGetPosts } from '~/api/endpoints/blogging/blogging'
import type { BlogDto, PostDto } from '~/api/models'
import { unwrapOrvalBody } from '~/api/unwrap-orval-body'

/**
 * Blog detail page showing a single blog and its posts.
 * Redirects to the OIDC provider when the user is not authenticated.
 * @returns {React.JSX.Element} The blog detail view with its list of posts.
 */
export default function BlogDetail(): React.JSX.Element {
  const auth = useAuth()
  const { id } = useParams<{ id: string }>()
  const numericId = Number.parseInt(id ?? '')
  const enabled = auth.isAuthenticated && !Number.isNaN(numericId)
  const { data: blogRaw, error: blogError, isLoading: blogIsLoading } = useGetBlog(numericId, { query: { enabled } })
  const { data: postsRaw, error: postsError, isLoading: postsIsLoading } = useGetPosts(numericId, { query: { enabled } })
  const blog = unwrapOrvalBody<BlogDto>(blogRaw)
  const posts = unwrapOrvalBody<PostDto[]>(postsRaw)

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      void auth.signinRedirect()
    }
  }, [auth, auth.isLoading, auth.isAuthenticated])

  if (auth.isLoading || (!auth.isAuthenticated && !auth.error)) return <div>Loading…</div>

  if (auth.error) {
    return (
      <div className="space-y-2">
        <p className="text-red-600">Authentication error: {auth.error.message}</p>
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors cursor-pointer"
          onClick={() => void auth.signinRedirect()}
        >
          Try signing in again
        </button>
      </div>
    )
  }

  if (blogIsLoading || postsIsLoading) return <div>Loading…</div>
  if (blogError != null || postsError != null || blog == null || posts == null) return <div>Error loading blog</div>

  return (
    <div>
      <h2>
        Blog: {blog.title} - {blog.url}
      </h2>
      <h3>Posts</h3>
      <ul>
        {posts.map((post: PostDto) => (
          <li key={post.postId}>
            <p>
              <Link to={`/blog/${blog.blogId}/post/${post.postId}`}>
                {post.title} - ({post.content})
              </Link>
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
