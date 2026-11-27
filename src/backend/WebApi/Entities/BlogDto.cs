using System.ComponentModel.DataAnnotations;
using WebApi.Database;

namespace WebApi.Entities;

/// <summary>
///     Blog DTO
/// </summary>
public record BlogDto : IBlog, IValidatableObject
{
    /// <summary>
    ///     Gets or sets the unique identifier for the blog.
    /// </summary>
    /// <example>1</example>
    public int BlogId { get; set; }

    /// <summary>
    ///     Gets or sets the title of the blog.
    /// </summary>
    /// <example>My blog title</example>
    public required string Title { get; set; }

    /// <summary>
    ///     Gets or sets the URL of the blog.
    /// </summary>
    /// <example>https://localhost/a-test-blog</example>
    public required string Url { get; set; }

    /// <inheritdoc />
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrEmpty(Title))
            yield return new ValidationResult($"{nameof(Title)} must be set");

        if (Title.Length > 500)
            yield return new ValidationResult($"{nameof(Title)} is longer than the maximum amount of characters (500)");

        if (string.IsNullOrEmpty(Url))
            yield return new ValidationResult($"{nameof(Url)} must be set");

        if (Url.Length > 1000)
            yield return new ValidationResult($"{nameof(Url)} is longer than the maximum amount of characters (1000)");
    }

    /// <summary>
    ///     Create DTO objects from DB entities
    /// </summary>
    /// <param name="blogs"></param>
    /// <returns></returns>
    public static IEnumerable<BlogDto> FromEntity(List<Blog> blogs) => blogs.Select(FromEntity);

    /// <summary>
    ///     Create DTO object from DB entity
    /// </summary>
    /// <param name="blog"></param>
    /// <returns></returns>
    public static BlogDto FromEntity(Blog blog) =>
        new()
        {
            BlogId = blog.BlogId,
            Title = blog.Title,
            Url = blog.Url
        };
}