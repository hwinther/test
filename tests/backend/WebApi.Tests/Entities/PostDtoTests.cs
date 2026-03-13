using WebApi.Entities;

namespace WebApi.Tests.Entities;

public class PostDtoTests : BaseDtoValidationTests<PostDto>
{
    [Fact]
    public void Validate_WhenTitleIsEmpty_ReturnsValidationError() =>
        Validate_ReturnsValidationError(MockPost with
                                        {
                                            Title = string.Empty
                                        },
                                        "Title must be set");

    [Fact]
    public void Validate_WhenTitleIsTooLong_ReturnsValidationError() =>
        Validate_ReturnsValidationError(MockPost with
                                        {
                                            Title = new string('a', 2001)
                                        },
                                        "Title is longer than the maximum amount of characters (2000)");

    [Fact]
    public void Validate_WhenContentIsEmpty_ReturnsValidationError() =>
        Validate_ReturnsValidationError(MockPost with
                                        {
                                            Content = string.Empty
                                        },
                                        "Content must be set");

    [Fact]
    public void Validate_WhenContentIsTooLong_ReturnsValidationError() =>
        Validate_ReturnsValidationError(MockPost with
                                        {
                                            Content = new string('a', 8001)
                                        },
                                        "Content is longer than the maximum amount of characters (8000)");

    [Fact]
    public void Validate_WhenBlogIdIsZero_ReturnsValidationError() =>
        Validate_ReturnsValidationError(MockPost with
                                        {
                                            BlogId = 0
                                        },
                                        "BlogId must be set");
}