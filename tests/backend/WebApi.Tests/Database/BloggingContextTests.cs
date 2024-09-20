using System.Data;
using System.Data.Common;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using WebApi.Database;
using WebApi.Repository;

namespace WebApi.Tests.Database;

[TestFixture]
public class BloggingContextTests
{
    [OneTimeSetUp]
    public async Task SetUp()
    {
        _msSqlContainer = new MsSqlDefaultConfiguration();
        await _msSqlContainer.InitializeAsync();

        _connectionString = _msSqlContainer.MsSqlContainer.GetConnectionString();
        var options = new DbContextOptionsBuilder<BloggingContext>()
                      .UseSqlServer(_connectionString)
                      .Options;

        _context = new BloggingContext(options);
    }

    [OneTimeTearDown]
    public async Task Cleanup()
    {
        await _msSqlContainer.DisposeAsync();
        await _context.DisposeAsync();
    }

    private BloggingContext _context;
    private MsSqlDefaultConfiguration _msSqlContainer;
    private string _connectionString;

    [Test]
    [Order(1)]
    public void ConnectionState_ReturnsOpen()
    {
        // Given
        using DbConnection connection = new SqlConnection(_msSqlContainer.MsSqlContainer.GetConnectionString());

        // When
        connection.Open();

        // Then
        Assert.That(connection.State, Is.EqualTo(ConnectionState.Open));
    }

    [Test]
    [Order(2)]
    public async Task BloggingContextMigrate_CreatesTablesAndCanStoreData()
    {
        // Act
        await _context.Database.MigrateAsync();

        var blogEntity = await _context.Blogs.AddAsync(new Blog
        {
            BlogId = 0,
            Title = "test blog",
            Url = "test://url"
        });

        await _context.SaveChangesAsync();

        await _context.Posts.AddAsync(new Post
        {
            PostId = 0,
            BlogId = blogEntity.Entity.BlogId,
            Title = "test post",
            Content = "test content"
        });

        await _context.SaveChangesAsync();

        // Assert
        Assert.That(_context.Blogs.Count(), Is.EqualTo(1));
        var blog = _context.Blogs.First();
        Assert.That(blog.Posts, Has.Count.EqualTo(1));
        var post = blog.Posts[0];

        Assert.Multiple(() =>
        {
            Assert.That(blog.Title, Is.EqualTo("test blog"));
            Assert.That(blog.Url, Is.EqualTo("test://url"));
            Assert.That(post.Title, Is.EqualTo("test post"));
            Assert.That(post.Content, Is.EqualTo("test content"));
            Assert.That(post.Blog, Is.Not.Null);
        });

        Assert.That(post.Blog.BlogId, Is.EqualTo(blog.BlogId));
    }

    [Test]
    [Order(3)]
    public async Task BloggingRepository_ReturnsSeededBlogsAndPosts()
    {
        // Arrange
        var bloggingRepository = new BloggingRepository(_context);

        // Act and Assert
        var blogs = (await bloggingRepository.ListBlogsAsync(CancellationToken.None)).ToList();
        Assert.That(blogs, Has.Count.EqualTo(1));
        var blog = blogs[0];

        var blogAgain = await bloggingRepository.GetBlogAsync(blog.BlogId, CancellationToken.None);
        Assert.That(blogAgain, Is.Not.Null);

        var posts = (await bloggingRepository.ListPostsAsync(blog.BlogId,
                                                             CancellationToken.None)).ToList();

        Assert.That(posts, Has.Count.EqualTo(1));
        var post = posts[0];
        var postAgain = await bloggingRepository.GetPostAsync(post.PostId, CancellationToken.None);
        Assert.That(postAgain, Is.Not.Null);

        Assert.That(await bloggingRepository.GetBlogAsync(100, CancellationToken.None), Is.Null);
        Assert.That(await bloggingRepository.GetPostAsync(100, CancellationToken.None), Is.Null);
    }

    [Test]
    [Order(4)]
    public async Task BloggingRepository_CanAddBlog()
    {
        // Arrange
        var bloggingRepository = new BloggingRepository(_context);

        // Act
        var blog = await bloggingRepository.AddOrUpdateBlogAsync(MockBlog with
                                                                 {
                                                                     BlogId = 0
                                                                 },
                                                                 CancellationToken.None);

        // Assert
        Assert.That(blog, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(blog.BlogId, Is.Not.Zero);
            Assert.That(blog.Title, Is.EqualTo(MockBlog.Title));
            Assert.That(blog.Url, Is.EqualTo(MockBlog.Url));
        });
    }

    [Test]
    [Order(5)]
    public async Task BloggingRepository_CanAddPost()
    {
        // Arrange
        var bloggingRepository = new BloggingRepository(_context);
        var blog = (await bloggingRepository.ListBlogsAsync(CancellationToken.None)).First();

        // Act
        var post = await bloggingRepository.AddOrUpdatePostAsync(MockPost with
                                                                 {
                                                                     BlogId = blog.BlogId,
                                                                     PostId = 0
                                                                 },
                                                                 CancellationToken.None);

        // Assert
        Assert.That(post, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(post.PostId, Is.Not.Zero);
            Assert.That(post.Title, Is.EqualTo(MockPost.Title));
            Assert.That(post.Content, Is.EqualTo(MockPost.Content));
        });
    }

    [Test]
    [Order(6)]
    public async Task BloggingRepository_CanUpdateBlogs()
    {
        // Arrange
        var bloggingRepository = new BloggingRepository(_context);
        var blog = (await bloggingRepository.ListBlogsAsync(CancellationToken.None)).First();

        // Act
        var blogResult = await bloggingRepository.AddOrUpdateBlogAsync(blog with
                                                                       {
                                                                           Title = "changed"
                                                                       },
                                                                       CancellationToken.None);

        var blogDoesNotExistResult = await bloggingRepository.AddOrUpdateBlogAsync(blog with
                                                                                   {
                                                                                       BlogId = 100,
                                                                                       Title = "changed"
                                                                                   },
                                                                                   CancellationToken.None);

        // Assert
        Assert.That(blogResult, Is.Not.Null);
        Assert.That(blogResult.Title, Is.EqualTo("changed"));
        Assert.That(blogDoesNotExistResult, Is.Null);
    }

    [Test]
    [Order(7)]
    public async Task BloggingRepository_CanUpdatePosts()
    {
        // Arrange
        var bloggingRepository = new BloggingRepository(_context);
        var blog = (await bloggingRepository.ListBlogsAsync(CancellationToken.None)).First();
        var post = (await bloggingRepository.ListPostsAsync(blog.BlogId, CancellationToken.None)).First();

        // Act
        var postResult = await bloggingRepository.AddOrUpdatePostAsync(post with
                                                                       {
                                                                           Title = "changed"
                                                                       },
                                                                       CancellationToken.None);

        var postDoesNotExistResult = await bloggingRepository.AddOrUpdatePostAsync(post with
                                                                                   {
                                                                                       PostId = 100,
                                                                                       Title = "changed"
                                                                                   },
                                                                                   CancellationToken.None);

        // Assert
        Assert.That(postResult, Is.Not.Null);
        Assert.That(postResult.Title, Is.EqualTo("changed"));
        Assert.That(postDoesNotExistResult, Is.Null);
    }
}