using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using WebApi.Controllers;
using WebApi.Entities;
using WebApi.Repository;

namespace WebApi.Tests.Controllers;

[TestFixture]
public class BloggingControllerTests
{
    [SetUp]
    public void SetUp()
    {
        _loggerMock = new Mock<ILogger<BloggingController>>();
        _bloggingRepositoryMock = new Mock<IBloggingRepository>();
        _controller = new BloggingController(_loggerMock.Object, _bloggingRepositoryMock.Object);
    }
    private Mock<ILogger<BloggingController>> _loggerMock;
    private Mock<IBloggingRepository> _bloggingRepositoryMock;
    private BloggingController _controller;

    private readonly BlogDto _mockBlog = new()
    {
        BlogId = 1,
        Title = "Test Blog",
        Url = "test://url"
    };
    private BlogDto _mockBlogFactory(int id) =>
        _mockBlog with
        {
            BlogId = id,
            Title = $"Blog entry {id}"
        };

    private readonly PostDto _mockPost = new()
    {
        BlogId = 1,
        PostId = 1,
        Title = "Test Blog",
        Content = "Test content"
    };
    private PostDto _mockPostFactory(int id) =>
        _mockPost with
        {
            PostId = id,
            Title = $"Post entry {id}"
        };

    [Test]
    public async Task GetBlogs_ReturnsListOfBlogs()
    {
        // Arrange
        var blogs = new List<BlogDto>
        {
            _mockBlog,
            _mockBlogFactory(2)
        };

        _bloggingRepositoryMock.Setup(static repo => repo.ListBlogsAsync(It.IsAny<CancellationToken>()))
                               .ReturnsAsync(blogs);

        // Act
        var result = await _controller.GetBlogs(CancellationToken.None);

        // Assert
        Assert.That(result, Is.InstanceOf<ActionResult<IEnumerable<BlogDto>>>());
        var okResult = result.Result as OkObjectResult;
        Assert.That(okResult, Is.Not.Null);
        var returnedBlogs = okResult.Value as IEnumerable<BlogDto>;
        Assert.That(returnedBlogs, Is.Not.Null);
        Assert.That(returnedBlogs.Count(), Is.EqualTo(2));
    }

    [Test]
    public async Task GetBlog_ValidId_ReturnsBlog()
    {
        // Arrange
        _bloggingRepositoryMock.Setup(static repo => repo.GetBlogAsync(1, It.IsAny<CancellationToken>()))
                               .ReturnsAsync(_mockBlog);

        // Act
        var result = await _controller.GetBlog(1, CancellationToken.None);

        // Assert
        Assert.That(result, Is.InstanceOf<ActionResult<BlogDto>>());
        var returnedBlog = result.Value;
        Assert.That(returnedBlog, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(returnedBlog.BlogId, Is.EqualTo(_mockBlog.BlogId));
            Assert.That(returnedBlog.Title, Is.EqualTo(_mockBlog.Title));
            Assert.That(returnedBlog.Url, Is.EqualTo(_mockBlog.Url));
        });
    }

    [Test]
    public async Task GetBlog_InvalidId_ReturnsNotFound()
    {
        // Arrange
        _bloggingRepositoryMock.Setup(static repo => repo.GetBlogAsync(1, It.IsAny<CancellationToken>()))
                               .ReturnsAsync((BlogDto?) null);

        // Act
        var result = await _controller.GetBlog(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.InstanceOf<NotFoundResult>());
    }

    [Test]
    public async Task PostBlog_NoId_StoresBlog()
    {
        // Arrange
        var blog = _mockBlog with
        {
            BlogId = 0
        };

        var blogId = 1;

        _bloggingRepositoryMock.Setup(static repo => repo.AddOrUpdateBlogAsync(It.IsAny<BlogDto>(), It.IsAny<CancellationToken>()))
                               .ReturnsAsync(_mockBlog with
                               {
                                   BlogId = blogId
                               });

        // Act
        var result = await _controller.PostBlog(blog,
                                                CancellationToken.None);

        // Assert
        Assert.That(result, Is.InstanceOf<ActionResult<BlogDto>>());
        var returnedBlog = result.Value;
        Assert.That(returnedBlog, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(returnedBlog.BlogId, Is.EqualTo(blogId));
            Assert.That(returnedBlog.Title, Is.EqualTo(_mockBlog.Title));
            Assert.That(returnedBlog.Url, Is.EqualTo(_mockBlog.Url));
        });
    }

    [Test]
    public async Task PostBlog_InvalidId_ReturnsNotFound()
    {
        // Arrange
        _bloggingRepositoryMock.Setup(static repo => repo.AddOrUpdateBlogAsync(It.IsAny<BlogDto>(), It.IsAny<CancellationToken>()))
                               .ReturnsAsync((BlogDto?) null);

        // Act
        var result = await _controller.PostBlog(_mockBlog, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.InstanceOf<NotFoundResult>());
    }

    [Test]
    public async Task GetPosts_ReturnsListOfPosts()
    {
        // Arrange
        var posts = new List<PostDto>
        {
            _mockPost,
            _mockPostFactory(2)
        };

        _bloggingRepositoryMock.Setup(static repo => repo.ListPostsAsync(1, It.IsAny<CancellationToken>()))
                               .ReturnsAsync(posts);

        // Act
        var result = await _controller.GetPosts(1, CancellationToken.None);

        // Assert
        Assert.That(result, Is.InstanceOf<ActionResult<IEnumerable<PostDto>>>());
        var okResult = result.Result as OkObjectResult;
        Assert.That(okResult, Is.Not.Null);
        var returnedPosts = okResult.Value as IEnumerable<PostDto>;
        Assert.That(returnedPosts, Is.Not.Null);
        Assert.That(returnedPosts.Count(), Is.EqualTo(2));
    }

    [Test]
    public async Task GetPost_ValidId_ReturnsPost()
    {
        // Arrange
        _bloggingRepositoryMock.Setup(static repo => repo.GetPostAsync(1, It.IsAny<CancellationToken>()))
                               .ReturnsAsync(_mockPost);

        // Act
        var result = await _controller.GetPost(1, CancellationToken.None);

        // Assert
        Assert.That(result, Is.InstanceOf<ActionResult<PostDto>>());
        var returnedPost = result.Value;
        Assert.That(returnedPost, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(returnedPost.PostId, Is.EqualTo(_mockPost.PostId));
            Assert.That(returnedPost.Title, Is.EqualTo(_mockPost.Title));
            Assert.That(returnedPost.BlogId, Is.EqualTo(_mockPost.BlogId));
            Assert.That(returnedPost.Content, Is.EqualTo(_mockPost.Content));
        });
    }

    [Test]
    public async Task GetPost_InvalidId_ReturnsNotFound()
    {
        // Arrange
        _bloggingRepositoryMock.Setup(static repo => repo.GetPostAsync(1, It.IsAny<CancellationToken>()))
                               .ReturnsAsync((PostDto?) null);

        // Act
        var result = await _controller.GetPost(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.InstanceOf<NotFoundResult>());
    }

    [Test]
    public async Task PostPost_NoId_StoresPost()
    {
        // Arrange
        var post = _mockPost with
        {
            PostId = 0
        };

        var postId = 1;

        _bloggingRepositoryMock.Setup(static repo => repo.AddOrUpdatePostAsync(It.IsAny<PostDto>(), It.IsAny<CancellationToken>()))
                               .ReturnsAsync(_mockPost with
                               {
                                   PostId = postId
                               });

        // Act
        var result = await _controller.PostPost(post,
                                                CancellationToken.None);

        // Assert
        Assert.That(result, Is.InstanceOf<ActionResult<PostDto>>());
        var returnedPost = result.Value;
        Assert.That(returnedPost, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(returnedPost.PostId, Is.EqualTo(postId));
            Assert.That(returnedPost.Title, Is.EqualTo(_mockPost.Title));
            Assert.That(returnedPost.BlogId, Is.EqualTo(_mockPost.BlogId));
            Assert.That(returnedPost.Content, Is.EqualTo(_mockPost.Content));
        });
    }

    [Test]
    public async Task PostPost_InvalidId_ReturnsNotFound()
    {
        // Arrange
        _bloggingRepositoryMock.Setup(static repo => repo.AddOrUpdatePostAsync(It.IsAny<PostDto>(), It.IsAny<CancellationToken>()))
                               .ReturnsAsync((PostDto?) null);

        // Act
        var result = await _controller.PostPost(_mockPost, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.InstanceOf<NotFoundResult>());
    }
}