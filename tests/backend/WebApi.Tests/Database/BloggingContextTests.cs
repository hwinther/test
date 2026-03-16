using System.Data;
using System.Data.Common;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using WebApi.Database;
using WebApi.Repository;

namespace WebApi.Tests.Database;

[Collection("BloggingContext")]
public class BloggingContextTests : IAsyncLifetime, IAsyncDisposable
{
    private BloggingContext _context = null!;
    private MsSqlDefaultConfiguration _msSqlContainer = null!;
    private string _connectionString = null!;

    public async ValueTask InitializeAsync()
    {
        _msSqlContainer = new MsSqlDefaultConfiguration();
        await _msSqlContainer.InitializeAsync();

        _connectionString = _msSqlContainer.MsSqlContainer.GetConnectionString();
        var options = new DbContextOptionsBuilder<BloggingContext>()
                      .UseSqlServer(_connectionString)
                      .Options;

        _context = new BloggingContext(options);
        await _context.Database.MigrateAsync(CancellationToken.None);

        var blogEntity = await _context.Blogs.AddAsync(new Blog
        {
            BlogId = 0,
            Title = "test blog",
            Url = "test://url"
        }, CancellationToken.None);
        await _context.SaveChangesAsync(CancellationToken.None);

        await _context.Posts.AddAsync(new Post
        {
            PostId = 0,
            BlogId = blogEntity.Entity.BlogId,
            Title = "test post",
            Content = "test content"
        }, CancellationToken.None);
        await _context.SaveChangesAsync(CancellationToken.None);
    }

    public async ValueTask DisposeAsync()
    {
        await _context.DisposeAsync();
        await _msSqlContainer.DisposeAsync();
    }

    [Fact]
    public void ConnectionState_ReturnsOpen()
    {
        // Given
        using DbConnection connection = new SqlConnection(_msSqlContainer.MsSqlContainer.GetConnectionString());

        // When
        connection.Open();

        // Then
        Assert.Equal(ConnectionState.Open, connection.State);
    }

    [Fact]
    public void BloggingContextMigrate_CreatesTablesAndCanStoreData()
    {
        // Assert: schema and seeded data from InitializeAsync
        Assert.Equal(1, _context.Blogs.Count());
        var blog = _context.Blogs.First();
        Assert.Single(blog.Posts);
        var post = blog.Posts[0];

        Assert.Equal("test blog", blog.Title);
        Assert.Equal("test://url", blog.Url);
        Assert.Equal("test post", post.Title);
        Assert.Equal("test content", post.Content);
        Assert.NotNull(post.Blog);
        Assert.Equal(blog.BlogId, post.Blog.BlogId);
    }

    [Fact]
    public async Task BloggingRepository_ReturnsSeededBlogsAndPosts()
    {
        // Arrange
        var bloggingRepository = new BloggingRepository(_context);

        // Act and Assert
        var ct = TestContext.Current.CancellationToken;
        var blogs = (await bloggingRepository.ListBlogsAsync(ct)).ToList();
        Assert.Single(blogs);
        var blog = blogs[0];

        var blogAgain = await bloggingRepository.GetBlogAsync(blog.BlogId, ct);
        Assert.NotNull(blogAgain);

        var posts = (await bloggingRepository.ListPostsAsync(blog.BlogId, ct)).ToList();

        Assert.Single(posts);
        var post = posts[0];
        var postAgain = await bloggingRepository.GetPostAsync(post.PostId, ct);
        Assert.NotNull(postAgain);

        Assert.Null(await bloggingRepository.GetBlogAsync(100, ct));
        Assert.Null(await bloggingRepository.GetPostAsync(100, ct));
    }

    [Fact]
    public async Task BloggingRepository_CanAddBlog()
    {
        // Arrange
        var bloggingRepository = new BloggingRepository(_context);

        // Act
        var blog = await bloggingRepository.AddOrUpdateBlogAsync(MockBlog with
                                                                 {
                                                                     BlogId = 0
                                                                 },
                                                                 TestContext.Current.CancellationToken);

        // Assert
        Assert.NotNull(blog);
        Assert.NotEqual(0, blog.BlogId);
        Assert.Equal(MockBlog.Title, blog.Title);
        Assert.Equal(MockBlog.Url, blog.Url);
    }

    [Fact]
    public async Task BloggingRepository_CanAddPost()
    {
        // Arrange
        var bloggingRepository = new BloggingRepository(_context);
        var ct = TestContext.Current.CancellationToken;
        var blog = (await bloggingRepository.ListBlogsAsync(ct)).First();

        // Act
        var post = await bloggingRepository.AddOrUpdatePostAsync(MockPost with
                                                                 {
                                                                     BlogId = blog.BlogId,
                                                                     PostId = 0
                                                                 },
                                                                 ct);

        // Assert
        Assert.NotNull(post);
        Assert.NotEqual(0, post.PostId);
        Assert.Equal(MockPost.Title, post.Title);
        Assert.Equal(MockPost.Content, post.Content);
    }

    [Fact]
    public async Task BloggingRepository_CanUpdateBlogs()
    {
        // Arrange
        var ct = TestContext.Current.CancellationToken;
        var bloggingRepository = new BloggingRepository(_context);
        var blog = (await bloggingRepository.ListBlogsAsync(ct)).First();

        // Act
        var blogResult = await bloggingRepository.AddOrUpdateBlogAsync(blog with
                                                                       {
                                                                           Title = "changed"
                                                                       },
                                                                       ct);

        var blogDoesNotExistResult = await bloggingRepository.AddOrUpdateBlogAsync(blog with
                                                                                   {
                                                                                       BlogId = 100,
                                                                                       Title = "changed"
                                                                                   },
                                                                                   ct);

        // Assert
        Assert.NotNull(blogResult);
        Assert.Equal("changed", blogResult.Title);
        Assert.Null(blogDoesNotExistResult);
    }

    [Fact]
    public async Task BloggingRepository_CanUpdatePosts()
    {
        // Arrange
        var ct = TestContext.Current.CancellationToken;
        var bloggingRepository = new BloggingRepository(_context);
        var blog = (await bloggingRepository.ListBlogsAsync(ct)).First();
        var post = (await bloggingRepository.ListPostsAsync(blog.BlogId, ct)).First();

        // Act
        var postResult = await bloggingRepository.AddOrUpdatePostAsync(post with
                                                                       {
                                                                           Title = "changed"
                                                                       },
                                                                       ct);

        var postDoesNotExistResult = await bloggingRepository.AddOrUpdatePostAsync(post with
                                                                                   {
                                                                                       PostId = 100,
                                                                                       Title = "changed"
                                                                                   },
                                                                                   ct);

        // Assert
        Assert.NotNull(postResult);
        Assert.Equal("changed", postResult.Title);
        Assert.Null(postDoesNotExistResult);
    }
}
