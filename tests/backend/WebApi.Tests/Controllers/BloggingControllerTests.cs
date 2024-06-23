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

    [Test]
    public async Task GetBlogs_ReturnsListOfBlogs()
    {
        // Arrange
        var blogs = new List<BlogDto>
        {
            new()
            {
                Url = "url1",
                Title = "title1"
            },
            new()
            {
                Url = "url2",
                Title = "title2"
            }
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
        var blog = new BlogDto
        {
            BlogId = 1,
            Title = "Test Blog",
            Url = "test://url"
        };

        _bloggingRepositoryMock.Setup(static repo => repo.GetBlogAsync(1, It.IsAny<CancellationToken>()))
                               .ReturnsAsync(blog);

        // Act
        var result = await _controller.GetBlog(1, CancellationToken.None);

        // Assert
        Assert.That(result, Is.InstanceOf<ActionResult<BlogDto>>());
        var returnedBlog = result.Value;
        Assert.That(returnedBlog, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(returnedBlog.BlogId, Is.EqualTo(blog.BlogId));
            Assert.That(returnedBlog.Title, Is.EqualTo(blog.Title));
            Assert.That(returnedBlog.Url, Is.EqualTo(blog.Url));
        });
    }

    // TODO: Implement tests for the remaining actions using a similar pattern.
}