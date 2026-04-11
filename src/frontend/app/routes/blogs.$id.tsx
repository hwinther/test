import React from 'react'
import { Link, useParams } from 'react-router'

import { useGetBlog, useGetPosts } from '~/api/endpoints/blogging/blogging'
import type { BlogDto, PostDto } from '~/api/models'
import { unwrapOrvalBody } from '~/api/unwrap-orval-body'

/**
 * Blog detail page showing a single blog and its posts.
 * @returns {React.JSX.Element} The blog detail view with its list of posts.
 */
export default function BlogDetail(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const numericId = Number.parseInt(id ?? '')
  const { data: blogRaw, error: blogError, isLoading: blogIsLoading } = useGetBlog(numericId)
  const { data: postsRaw, error: postsError, isLoading: postsIsLoading } = useGetPosts(numericId)
  const blog = unwrapOrvalBody<BlogDto>(blogRaw)
  const posts = unwrapOrvalBody<PostDto[]>(postsRaw)

  if (blogIsLoading || postsIsLoading) return <div>Loading...</div>
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
