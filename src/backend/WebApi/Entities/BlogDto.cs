using System.ComponentModel.DataAnnotations;

namespace WebApi.Entities;

/// <summary>
///     Blog DTO
/// </summary>
public record BlogDto : IBlog, IValidatableObject
{
    /// <inheritdoc />
    public int BlogId { get; set; }

    /// <inheritdoc />
    public required string Url { get; set; }

    /// <inheritdoc />
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
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
            Url = blog.Url
        };
}