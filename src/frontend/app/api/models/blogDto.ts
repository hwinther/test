//@ts-nocheck

/**
 * Blog DTO
 */
export interface BlogDto {
  /** Gets or sets the unique identifier for the blog. */
  blogId?: number
  /**
   * Gets or sets the title of the blog.
   * @nullable
   */
  title: string | null
  /**
   * Gets or sets the URL of the blog.
   * @nullable
   */
  url: string | null
}
