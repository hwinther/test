import React, { useEffect } from 'react'
import { Link } from 'react-router'
import { useAuth } from 'react-oidc-context'

import { useGetBlogs } from '~/api/endpoints/blogging/blogging'
import type { BlogDto } from '~/api/models'
import { unwrapOrvalBody } from '~/api/unwrap-orval-body'

/**
 * Blog listing page displaying all available blogs.
 * Redirects to the OIDC provider when the user is not authenticated.
 * @returns {React.JSX.Element} The blog listing view.
 */
export default function Blogs(): React.JSX.Element {
  const auth = useAuth()
  const { data: blogsRaw, error, isLoading } = useGetBlogs({ query: { enabled: auth.isAuthenticated } })
  const blogs = unwrapOrvalBody<BlogDto[]>(blogsRaw)

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

  if (isLoading) return <div>Loading…</div>
  if (error != null) return <div>Error loading blogs</div>

  return (
    <div>
      <h2>Blogs</h2>
      <ul>
        {blogs?.map((blog: BlogDto) => (
          <li key={blog.blogId}>
            <p>
              <Link to={`/blogs/${blog.blogId}`}>
                {blog.title} - ({blog.url})
              </Link>
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
