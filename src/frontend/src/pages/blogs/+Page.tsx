import React from 'react'

import { useGetBlogs } from '~/api/endpoints/blogging/blogging'
import { Link } from '~/renderer/Link'

const BlogListView: React.FC = () => {
  const { data: blogs, error, isLoading } = useGetBlogs()

  if (isLoading === true) return <div>Loading...</div>
  if (error != null) return <div>Error loading blogs</div>

  return (
    <div>
      <h2>Blogs</h2>
      <ul>
        {blogs?.map((blog) => (
          <li key={blog.blogId}>
            <p>
              <Link className="is-active" href={`/blogs/${blog.blogId}`}>
                {blog.title} - ({blog.url})
              </Link>
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default BlogListView
