using Microsoft.EntityFrameworkCore;

namespace WebApi;

/// <summary>
///     TODO
/// </summary>
public class BloggingContext(DbContextOptions<BloggingContext> options) : DbContext(options)
{
    /// <summary>
    ///     TODO
    /// </summary>
    public DbSet<Blog> Blogs { get; set; }

    /// <summary>
    ///     TODO
    /// </summary>
    public DbSet<Post> Posts { get; set; }
}

/// <summary>
///     TODO
/// </summary>
public class Blog
{
    /// <summary>
    ///     TODO
    /// </summary>
    public int BlogId { get; set; }

    /// <summary>
    ///     TODO
    /// </summary>
    public string Url { get; set; } = string.Empty;

    /// <summary>
    ///     TODO
    /// </summary>
    public List<Post> Posts { get; } = new();
}

/// <summary>
///     TODO
/// </summary>
public class Post
{
    /// <summary>
    ///     TODO
    /// </summary>
    public int PostId { get; set; }
    /// <summary>
    ///     TODO
    /// </summary>
    public string Title { get; set; } = string.Empty;
    /// <summary>
    ///     TODO
    /// </summary>
    public string Content { get; set; } = string.Empty;
    /// <summary>
    ///     TODO
    /// </summary>
    public int BlogId { get; set; }
    /// <summary>
    ///     TODO
    /// </summary>
    public Blog? Blog { get; set; }
}