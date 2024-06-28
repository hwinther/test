import React from 'react'
import { usePageContext } from 'vike-react/usePageContext'

import { useGetBlog, useGetPosts } from '~/api/endpoints/blogging/blogging'
import { Link } from '~/renderer/Link'

const BlogListView: React.FC = () => {
  const pageContext = usePageContext()
  const id = pageContext?.routeParams?.id ?? window.location.pathname.split('/').at(-1)
  const { data: blog, error: blogError, isLoading: blogIsLoading } = useGetBlog(parseInt(id ?? '0'))
  const { data: posts, error: postsError, isLoading: postsIsLoading } = useGetPosts(parseInt(id ?? '0'))

  if (blogIsLoading === true || postsIsLoading === true) return <div>Loading...</div>
  if (blogError != null || blog === null || postsError != null || posts === null) return <div>Error loading blog</div>

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
              <Link className="is-active" href={`/blog/${blog?.blogId}/post/${post?.postId}`}>
                {post.title} - ({post.content})
              </Link>
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default BlogListView
