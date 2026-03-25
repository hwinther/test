import React from 'react'
import { Link, useParams } from 'react-router'

import { useGetBlog, useGetPosts } from '~/api/endpoints/blogging/blogging'

const BlogDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const numericId = Number.parseInt(id ?? '')
  const { data: blog, error: blogError, isLoading: blogIsLoading } = useGetBlog(numericId)
  const { data: posts, error: postsError, isLoading: postsIsLoading } = useGetPosts(numericId)

  if (blogIsLoading || postsIsLoading) return <div>Loading...</div>
  if (blogError != null || blog === undefined || postsError != null || posts === undefined)
    return <div>Error loading blog</div>

  return (
    <div>
      <h2>
        Blog: {blog?.title} - {blog?.url}
      </h2>
      <h3>Posts</h3>
      <ul>
        {posts?.map((post) => (
          <li key={post.postId}>
            <p>
              <Link to={`/blog/${blog?.blogId}/post/${post.postId}`}>
                {post.title} - ({post.content})
              </Link>
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default BlogDetailView
