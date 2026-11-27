using System.ComponentModel.DataAnnotations;
using WebApi.Database;

namespace WebApi.Entities;

/// <summary>
///     Post DTO
/// </summary>
public record PostDto : IPost, IValidatableObject
{
    /// <summary>
    ///     Gets or sets the unique identifier for the post.
    /// </summary>
    /// <example>1</example>
    public int PostId { get; set; }

    /// <summary>
    ///     Gets or sets the title of the post.
    /// </summary>
    /// <example>Bob Loblaw's Law Blog</example>
    public required string Title { get; set; }

    /// <summary>
    ///     Gets or sets the content of the post.
    /// </summary>
    /// <example>Example blog post content</example>
    public required string Content { get; set; }

    /// <summary>
    ///     Gets or sets the unique identifier of the blog to which the post belongs.
    /// </summary>
    /// <example>1</example>
    public required int BlogId { get; set; }

    /// <inheritdoc />
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrEmpty(Title))
            yield return new ValidationResult($"{nameof(Title)} must be set");

        if (string.IsNullOrEmpty(Content))
            yield return new ValidationResult($"{nameof(Content)} must be set");

        if (Title.Length > 2000)
            yield return new ValidationResult($"{nameof(Title)} is longer than the maximum amount of characters (2000)");

        if (Content.Length > 8000)
            yield return new ValidationResult($"{nameof(Content)} is longer than the maximum amount of characters (8000)");

        if (BlogId == default)
            yield return new ValidationResult($"{nameof(BlogId)} must be set");
    }

    /// <summary>
    ///     Create DTO objects from DB entities
    /// </summary>
    /// <param name="posts"></param>
    /// <returns></returns>
    public static IEnumerable<PostDto> FromEntity(List<Post> posts) => posts.Select(FromEntity);

    /// <summary>
    ///     Create DTO object from DB entity
    /// </summary>
    /// <param name="post"></param>
    /// <returns></returns>
    public static PostDto FromEntity(Post post) =>
        new()
        {
            PostId = post.PostId,
            Title = post.Title,
            Content = post.Content,
            BlogId = post.BlogId
        };
}