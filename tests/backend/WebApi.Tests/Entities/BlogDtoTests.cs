using WebApi.Entities;

namespace WebApi.Tests.Entities;

[TestFixture]
public class BlogDtoTests : BaseDtoValidationTests<BlogDto>
{
    [Test]
    public void Validate_WhenTitleIsEmpty_ReturnsValidationError() =>
        Validate_ReturnsValidationError(MockBlog with
                                        {
                                            Title = string.Empty
                                        },
                                        "Title must be set");

    [Test]
    public void Validate_WhenTitleIsTooLong_ReturnsValidationError() =>
        Validate_ReturnsValidationError(MockBlog with
                                        {
                                            Title = new string('a', 501)
                                        },
                                        "Title is longer than the maximum amount of characters (500)");

    [Test]
    public void Validate_WhenUrlIsEmpty_ReturnsValidationError() =>
        Validate_ReturnsValidationError(MockBlog with
                                        {
                                            Url = string.Empty
                                        },
                                        "Url must be set");

    [Test]
    public void Validate_WhenUrlIsTooLong_ReturnsValidationError() =>
        Validate_ReturnsValidationError(MockBlog with
                                        {
                                            Url = new string('a', 1001)
                                        },
                                        "Url is longer than the maximum amount of characters (1000)");
}