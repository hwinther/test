using System.Data;
using System.Data.Common;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using WebApi.Database;

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
}