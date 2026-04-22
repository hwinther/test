import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from 'react-oidc-context'

import { useGetBlogs } from '~/api/endpoints/blogging/blogging'
import type { BlogDto } from '~/api/models'
import { unwrapOrvalBody } from '~/api/unwrap-orval-body'
import { BlogFormModal } from '~/components/BlogFormModal'

/**
 * Blog listing page. Redirects to OIDC when unauthenticated.
 * @returns {React.JSX.Element} The blog listing view.
 */
export default function Blogs(): React.JSX.Element {
  const auth = useAuth()
  const { data: blogsRaw, error, isLoading } = useGetBlogs({ query: { enabled: auth.isAuthenticated } })
  const blogs = unwrapOrvalBody<BlogDto[]>(blogsRaw)
  const [blogForm, setBlogForm] = useState<{ blog?: BlogDto } | null>(null)

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Blogs</h2>
        <button
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 transition-colors cursor-pointer"
          onClick={() => setBlogForm({})}
        >
          New blog
        </button>
      </div>

      {blogs == null || blogs.length === 0 ? (
        <p className="text-neutral-500 text-sm">No blogs yet.</p>
      ) : (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {blogs.map((blog: BlogDto) => (
            <li key={blog.blogId} className="flex items-center justify-between py-3 gap-4">
              <Link
                to={`/blogs/${blog.blogId}`}
                className="min-w-0"
              >
                <span className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200">
                  {blog.title}
                </span>
                <span className="ml-2 text-sm text-neutral-500 truncate">{blog.url}</span>
              </Link>
              <button
                className="rounded-md px-3 py-1 text-sm bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer shrink-0"
                onClick={() => setBlogForm({ blog })}
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}

      {blogForm !== null && <BlogFormModal blog={blogForm.blog} onClose={() => setBlogForm(null)} />}
    </div>
  )
}
