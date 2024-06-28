// Import React and useGetBlogs
import React from 'react'

import { useGetBlogs } from '../../api/endpoints/blogging/blogging'

// BlogListView component
const BlogListView: React.FC = () => {
  const { data: blogs, error, isLoading } = useGetBlogs()

  // Loading state
  if (isLoading) return <div>Loading...</div>

  // Error state
  if (error != null) return <div>Error loading blogs</div>

  // Render blogs
  return (
    <div>
      <h2>Blogs</h2>
      <ul>
        {blogs?.map((blog) => (
          <li key={blog.blogId}>
            {/*<h3>{blog.title}</h3>*/}
            <p>{blog.url}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Export BlogListView
export default BlogListView
