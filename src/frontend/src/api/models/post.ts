//@ts-nocheck
import type { Blog } from './blog'

/**
 * Represents a post with a unique ID, title, content, and the associated blog ID.
 */
export interface Post {
  blog?: Blog
  /** Gets or sets the unique identifier of the blog to which the post belongs. */
  blogId?: number
  /**
   * Gets or sets the content of the post.
   * @nullable
   */
  content?: string | null
  /** Gets or sets the unique identifier for the post. */
  postId?: number
  /**
   * Gets or sets the title of the post.
   * @nullable
   */
  title?: string | null
}
