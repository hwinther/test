using WebApi.Entities;

namespace WebApi.Tests.Entities;

[TestFixture]
public class PostDtoTests : BaseDtoValidationTests<PostDto>
{
    [Test]
    public void Validate_WhenTitleIsEmpty_ReturnsValidationError() =>
        Validate_ReturnsValidationError(MockPost with
                                        {
                                            Title = string.Empty
                                        },
                                        "Title must be set");

    [Test]
    public void Validate_WhenTitleIsTooLong_ReturnsValidationError() =>
        Validate_ReturnsValidationError(MockPost with
                                        {
                                            Title = new string('a', 2001)
                                        },
                                        "Title is longer than the maximum amount of characters (2000)");

    [Test]
    public void Validate_WhenContentIsEmpty_ReturnsValidationError() =>
        Validate_ReturnsValidationError(MockPost with
                                        {
                                            Content = string.Empty
                                        },
                                        "Content must be set");

    [Test]
    public void Validate_WhenContentIsTooLong_ReturnsValidationError() =>
        Validate_ReturnsValidationError(MockPost with
                                        {
                                            Content = new string('a', 8001)
                                        },
                                        "Content is longer than the maximum amount of characters (8000)");

    [Test]
    public void Validate_WhenBlogIdIsZero_ReturnsValidationError() =>
        Validate_ReturnsValidationError(MockPost with
                                        {
                                            BlogId = 0
                                        },
                                        "BlogId must be set");
}