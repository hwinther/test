using System.ComponentModel.DataAnnotations;

namespace WebApi.Entities;

/// <summary>
///     TODO
/// </summary>
public class BlogPostDto : IValidatableObject
{
    /// <summary>
    ///     TODO
    /// </summary>
    public string? Test { get; set; }

    /// <inheritdoc />
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrEmpty(Test))
            yield return new ValidationResult($"{nameof(Test)} must be set");
    }
}