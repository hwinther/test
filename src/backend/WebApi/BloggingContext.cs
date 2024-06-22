using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

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
public interface IBlog
{
    /// <summary>
    ///     Gets or sets the unique identifier for the blog.
    /// </summary>
    public int BlogId { get; set; }

    /// <summary>
    ///     Gets or sets the URL of the blog.
    /// </summary>
    public string Url { get; set; }
}

/// <inheritdoc />
[EntityTypeConfiguration(typeof(BlogConfiguration))]
public class Blog : IBlog
{
    /// <summary>
    ///     Gets the collection of posts associated with the blog.
    /// </summary>
    public List<Post> Posts { get; } = [];

    /// <inheritdoc />
    public required int BlogId { get; set; }

    /// <inheritdoc />
    public required string Url { get; set; }
}

/// <summary>
///     Configuration for <see cref="Blog" />
/// </summary>
public class BlogConfiguration : IEntityTypeConfiguration<Blog>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<Blog> builder)
    {
        builder.Property(static post => post.Url)
               .HasMaxLength(1000);
    }
}

/// <summary>
///     Represents a post with a unique ID, title, content, and the associated blog ID.
/// </summary>
public interface IPost
{
    /// <summary>
    ///     Gets or sets the unique identifier for the post.
    /// </summary>
    public int PostId { get; set; }

    /// <summary>
    ///     Gets or sets the title of the post.
    /// </summary>
    public string Title { get; set; }

    /// <summary>
    ///     Gets or sets the content of the post.
    /// </summary>
    public string Content { get; set; }
}

/// <inheritdoc />
[EntityTypeConfiguration(typeof(PostConfiguration))]
public class Post : IPost
{
    /// <summary>
    ///     Gets or sets the unique identifier of the blog to which the post belongs.
    /// </summary>
    public required int BlogId { get; set; }

    /// <summary>
    ///     Gets or sets the blog to which the post belongs.
    /// </summary>
    public Blog? Blog { get; set; }
    /// <inheritdoc />
    public required int PostId { get; set; }

    /// <inheritdoc />
    public required string Title { get; set; }

    /// <inheritdoc />
    public required string Content { get; set; }
}

/// <summary>
///     Configuration for <see cref="Post" />
/// </summary>
public class PostConfiguration : IEntityTypeConfiguration<Post>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.Property(static post => post.Title)
               .HasMaxLength(2000);

        builder.Property(static post => post.Content)
               .HasMaxLength(8000);
    }
}