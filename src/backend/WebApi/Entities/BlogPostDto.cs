using System.ComponentModel.DataAnnotations;

namespace WebApi.Entities;

/// <summary>
///     DTO for blog post
/// </summary>
public class BlogPostDto : IValidatableObject
{
    /// <summary>
    ///     Gets or sets the test property.
    /// </summary>
    public string? Test { get; set; }

    /// <inheritdoc />
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrEmpty(Test))
            yield return new ValidationResult($"{nameof(Test)} must be set");
    }
}