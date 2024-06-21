//@ts-nocheck
import type { Post } from './post'

/**
 * Represents a blog with a unique ID, URL, and a collection of posts.
 */
export interface Blog {
  /** Gets or sets the unique identifier for the blog. */
  blogId?: number
  /**
   * Gets the collection of posts associated with the blog.
   * @nullable
   */
  readonly posts?: readonly Post[] | null
  /**
   * Gets or sets the URL of the blog.
   * @nullable
   */
  url?: string | null
}
