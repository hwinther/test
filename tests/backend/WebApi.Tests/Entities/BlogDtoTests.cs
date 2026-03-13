using WebApi.Entities;

namespace WebApi.Tests.Entities;

public class BlogDtoTests : BaseDtoValidationTests<BlogDto>
{
    [Fact]
    public void Validate_WhenTitleIsEmpty_ReturnsValidationError() =>
        Validate_ReturnsValidationError(MockBlog with
                                        {
                                            Title = string.Empty
                                        },
                                        "Title must be set");

    [Fact]
    public void Validate_WhenTitleIsTooLong_ReturnsValidationError() =>
        Validate_ReturnsValidationError(MockBlog with
                                        {
                                            Title = new string('a', 501)
                                        },
                                        "Title is longer than the maximum amount of characters (500)");

    [Fact]
    public void Validate_WhenUrlIsEmpty_ReturnsValidationError() =>
        Validate_ReturnsValidationError(MockBlog with
                                        {
                                            Url = string.Empty
                                        },
                                        "Url must be set");

    [Fact]
    public void Validate_WhenUrlIsTooLong_ReturnsValidationError() =>
        Validate_ReturnsValidationError(MockBlog with
                                        {
                                            Url = new string('a', 1001)
                                        },
                                        "Url is longer than the maximum amount of characters (1000)");
}