using Microsoft.EntityFrameworkCore;

namespace WebApi;

/// <summary>
///     Represents the database context for blogging, configuring entities and their relationships.
/// </summary>
/// <remarks>
///     Initializes a new instance of the <see cref="BloggingContext" /> class.
/// </remarks>
/// <param name="options">The options to be used by the DbContext.</param>
public class BloggingContext(DbContextOptions<BloggingContext> options) : DbContext(options)
{
    /// <summary>
    ///     Gets or sets the collection of blogs in the context.
    /// </summary>
    public DbSet<Blog> Blogs { get; set; }

    /// <summary>
    ///     Gets or sets the collection of posts in the context.
    /// </summary>
    public DbSet<Post> Posts { get; set; }
}

/// <summary>
///     Represents a blog with a unique ID, URL, and a collection of posts.
/// </summary>
public class Blog
{
    /// <summary>
    ///     Gets or sets the unique identifier for the blog.
    /// </summary>
    public int BlogId { get; set; }

    /// <summary>
    ///     Gets or sets the URL of the blog.
    /// </summary>
    public string Url { get; set; } = string.Empty;

    /// <summary>
    ///     Gets the collection of posts associated with the blog.
    /// </summary>
    public List<Post> Posts { get; } = [];
}

/// <summary>
///     Represents a post with a unique ID, title, content, and the associated blog ID.
/// </summary>
public class Post
{
    /// <summary>
    ///     Gets or sets the unique identifier for the post.
    /// </summary>
    public int PostId { get; set; }

    /// <summary>
    ///     Gets or sets the title of the post.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    ///     Gets or sets the content of the post.
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    ///     Gets or sets the unique identifier of the blog to which the post belongs.
    /// </summary>
    public int BlogId { get; set; }

    /// <summary>
    ///     Gets or sets the blog to which the post belongs.
    /// </summary>
    public Blog? Blog { get; set; }
}