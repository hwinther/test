using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Logging;
using Moq;
using WebApi.Controllers;
using WebApi.Entities;
using WebApi.Repository;

namespace WebApi.Tests.Controllers;

public class BloggingControllerTests
{
    private readonly Mock<ILogger<BloggingController>> _loggerMock;
    private readonly Mock<IBloggingRepository> _bloggingRepositoryMock;
    private readonly BloggingController _controller;

    public BloggingControllerTests()
    {
        _loggerMock = new Mock<ILogger<BloggingController>>();
        _bloggingRepositoryMock = new Mock<IBloggingRepository>();
        _controller = new BloggingController(_loggerMock.Object, _bloggingRepositoryMock.Object);
    }

    [Fact]
    public async Task GetBlogs_ReturnsListOfBlogs()
    {
        // Arrange
        var blogs = new List<BlogDto>
        {
            MockBlog,
            MockBlogFactory(2)
        };

        _bloggingRepositoryMock.Setup(static repo => repo.ListBlogsAsync(It.IsAny<CancellationToken>()))
                               .ReturnsAsync(blogs);

        // Act
        var result = await _controller.GetBlogs(CancellationToken.None);

        // Assert
        var ok = Assert.IsType<Ok<List<BlogDto>>>(result);
        Assert.NotNull(ok.Value);
        var returnedBlogs = ok.Value;
        Assert.NotNull(returnedBlogs);
        Assert.Equal(2, returnedBlogs.Count());
        _loggerMock.VerifyLog(LogLevel.Information, Times.Once(), "GetBlogs was called");
        _loggerMock.VerifyNoError();
    }

    [Fact]
    public async Task GetBlog_ValidId_ReturnsBlog()
    {
        // Arrange
        _bloggingRepositoryMock.Setup(static repo => repo.GetBlogAsync(1, It.IsAny<CancellationToken>()))
                               .ReturnsAsync(MockBlog);

        // Act
        var result = await _controller.GetBlog(1, CancellationToken.None);

        // Assert
        var ok = Assert.IsType<Ok<BlogDto>>(result.Result);
        var returnedBlog = ok.Value;
        Assert.NotNull(returnedBlog);
        Assert.Equal(MockBlog.BlogId, returnedBlog.BlogId);
        Assert.Equal(MockBlog.Title, returnedBlog.Title);
        Assert.Equal(MockBlog.Url, returnedBlog.Url);

        _loggerMock.VerifyLog(LogLevel.Information, Times.Once(), "GetBlog was called with id 1");
        _loggerMock.VerifyNoError();
    }

    [Fact]
    public async Task GetBlog_InvalidId_ReturnsNotFound()
    {
        // Arrange
        _bloggingRepositoryMock.Setup(static repo => repo.GetBlogAsync(1, It.IsAny<CancellationToken>()))
                               .ReturnsAsync((BlogDto?) null);

        // Act
        var result = await _controller.GetBlog(1, CancellationToken.None);

        // Assert
        Assert.IsType<NotFound>(result.Result);
        _loggerMock.VerifyLog(LogLevel.Information, Times.Once(), "GetBlog was called with id 1");
        _loggerMock.VerifyNoError();
    }

    [Fact]
    public async Task PostBlog_NoId_StoresBlog()
    {
        // Arrange
        var blog = MockBlog with
        {
            BlogId = 0
        };

        var blogId = 1;

        _bloggingRepositoryMock.Setup(static repo => repo.AddOrUpdateBlogAsync(It.IsAny<BlogDto>(), It.IsAny<CancellationToken>()))
                               .ReturnsAsync(MockBlog with
                               {
                                   BlogId = blogId
                               });

        // Act
        var result = await _controller.PostBlog(blog,
                                                CancellationToken.None);

        // Assert
        var ok = Assert.IsType<Ok<BlogDto>>(result.Result);
        var returnedBlog = ok.Value;
        Assert.NotNull(returnedBlog);
        Assert.Equal(blogId, returnedBlog.BlogId);
        Assert.Equal(MockBlog.Title, returnedBlog.Title);
        Assert.Equal(MockBlog.Url, returnedBlog.Url);

        _loggerMock.VerifyLog(LogLevel.Information, Times.Once(), "PostBlog was called");
        _loggerMock.VerifyNoError();
    }

    [Fact]
    public async Task PostBlog_InvalidId_ReturnsNotFound()
    {
        // Arrange
        _bloggingRepositoryMock.Setup(static repo => repo.AddOrUpdateBlogAsync(It.IsAny<BlogDto>(), It.IsAny<CancellationToken>()))
                               .ReturnsAsync((BlogDto?) null);

        // Act
        var result = await _controller.PostBlog(MockBlog, CancellationToken.None);

        // Assert
        Assert.IsType<NotFound>(result.Result);
        _loggerMock.VerifyLog(LogLevel.Information, Times.Once(), "PostBlog was called");
        _loggerMock.VerifyNoError();
    }

    [Fact]
    public async Task GetPosts_ReturnsListOfPosts()
    {
        // Arrange
        var posts = new List<PostDto>
        {
            MockPost,
            MockPostFactory(2)
        };

        _bloggingRepositoryMock.Setup(static repo => repo.ListPostsAsync(1, It.IsAny<CancellationToken>()))
                               .ReturnsAsync(posts);

        // Act
        var result = await _controller.GetPosts(1, CancellationToken.None);

        // Assert
        var ok = Assert.IsType<Ok<List<PostDto>>>(result);
        Assert.NotNull(ok.Value);
        var returnedPosts = ok.Value;
        Assert.NotNull(returnedPosts);
        Assert.Equal(2, returnedPosts.Count());
        _loggerMock.VerifyLog(LogLevel.Information, Times.Once(), "GetPosts was called with id 1");
        _loggerMock.VerifyNoError();
    }

    [Fact]
    public async Task GetPost_ValidId_ReturnsPost()
    {
        // Arrange
        _bloggingRepositoryMock.Setup(static repo => repo.GetPostAsync(1, It.IsAny<CancellationToken>()))
                               .ReturnsAsync(MockPost);

        // Act
        var result = await _controller.GetPost(1, CancellationToken.None);

        // Assert
        var ok = Assert.IsType<Ok<PostDto>>(result.Result);
        var returnedPost = ok.Value;
        Assert.NotNull(returnedPost);
        Assert.Equal(MockPost.PostId, returnedPost.PostId);
        Assert.Equal(MockPost.Title, returnedPost.Title);
        Assert.Equal(MockPost.BlogId, returnedPost.BlogId);
        Assert.Equal(MockPost.Content, returnedPost.Content);

        _loggerMock.VerifyLog(LogLevel.Information, Times.Once(), "GetPost was called with id 1");
        _loggerMock.VerifyNoError();
    }

    [Fact]
    public async Task GetPost_InvalidId_ReturnsNotFound()
    {
        // Arrange
        _bloggingRepositoryMock.Setup(static repo => repo.GetPostAsync(1, It.IsAny<CancellationToken>()))
                               .ReturnsAsync((PostDto?) null);

        // Act
        var result = await _controller.GetPost(1, CancellationToken.None);

        // Assert
        Assert.IsType<NotFound>(result.Result);
        _loggerMock.VerifyLog(LogLevel.Information, Times.Once(), "GetPost was called with id 1");
        _loggerMock.VerifyNoError();
    }

    [Fact]
    public async Task PostPost_NoId_StoresPost()
    {
        // Arrange
        var post = MockPost with
        {
            PostId = 0
        };

        var postId = 1;

        _bloggingRepositoryMock.Setup(static repo => repo.AddOrUpdatePostAsync(It.IsAny<PostDto>(), It.IsAny<CancellationToken>()))
                               .ReturnsAsync(MockPost with
                               {
                                   PostId = postId
                               });

        // Act
        var result = await _controller.PostPost(post,
                                                CancellationToken.None);

        // Assert
        var ok = Assert.IsType<Ok<PostDto>>(result.Result);
        var returnedPost = ok.Value;
        Assert.NotNull(returnedPost);
        Assert.Equal(postId, returnedPost.PostId);
        Assert.Equal(MockPost.Title, returnedPost.Title);
        Assert.Equal(MockPost.BlogId, returnedPost.BlogId);
        Assert.Equal(MockPost.Content, returnedPost.Content);

        _loggerMock.VerifyLog(LogLevel.Information, Times.Once(), "PostPost was called");
        _loggerMock.VerifyNoError();
    }

    [Fact]
    public async Task PostPost_InvalidId_ReturnsNotFound()
    {
        // Arrange
        _bloggingRepositoryMock.Setup(static repo => repo.AddOrUpdatePostAsync(It.IsAny<PostDto>(), It.IsAny<CancellationToken>()))
                               .ReturnsAsync((PostDto?) null);

        // Act
        var result = await _controller.PostPost(MockPost, CancellationToken.None);

        // Assert
        Assert.IsType<NotFound>(result.Result);
        _loggerMock.VerifyLog(LogLevel.Information, Times.Once(), "PostPost was called");
        _loggerMock.VerifyNoError();
    }
}
