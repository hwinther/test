import React from 'react'
import { Link } from 'react-router'

import { useGetBlogs } from '~/api/endpoints/blogging/blogging'

/**
 * Blog listing page displaying all available blogs.
 * @returns {React.JSX.Element} The blog listing view.
 */
export default function Blogs(): React.JSX.Element {
  const { data: blogs, error, isLoading } = useGetBlogs()

  if (isLoading) return <div>Loading...</div>
  if (error != null) return <div>Error loading blogs</div>

  return (
    <div>
      <h2>Blogs</h2>
      <ul>
        {blogs?.map((blog) => (
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
