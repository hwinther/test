import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useAuth } from 'react-oidc-context'

import { useGetBlog, useGetPosts } from '~/api/endpoints/blogging/blogging'
import type { BlogDto, PostDto } from '~/api/models'
import { unwrapOrvalBody } from '~/api/unwrap-orval-body'
import { BlogFormModal } from '~/components/BlogFormModal'
import { PostFormModal } from '~/components/PostFormModal'

/**
 * Blog detail page. Redirects to OIDC when unauthenticated.
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

  const [editBlog, setEditBlog] = useState(false)
  const [postForm, setPostForm] = useState<{ post?: PostDto } | null>(null)

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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold">{blog.title}</h2>
          <a
            href={blog.url ?? ''}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-500 hover:underline break-all"
          >
            {blog.url}
          </a>
        </div>
        <button
          className="rounded-md px-3 py-1.5 text-sm bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer shrink-0"
          onClick={() => setEditBlog(true)}
        >
          Edit blog
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Posts</h3>
          <button
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            onClick={() => setPostForm({})}
          >
            New post
          </button>
        </div>

        {posts.length === 0 ? (
          <p className="text-neutral-500 text-sm">No posts yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {posts.map((post: PostDto) => (
              <li key={post.postId} className="flex items-start justify-between py-3 gap-4">
                <div className="min-w-0">
                  <p className="font-medium">{post.title}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">{post.content}</p>
                </div>
                <button
                  className="rounded-md px-3 py-1 text-sm bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer shrink-0"
                  onClick={() => setPostForm({ post })}
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editBlog && <BlogFormModal blog={blog} onClose={() => setEditBlog(false)} />}
      {postForm !== null && <PostFormModal blogId={numericId} post={postForm.post} onClose={() => setPostForm(null)} />}
    </div>
  )
}
