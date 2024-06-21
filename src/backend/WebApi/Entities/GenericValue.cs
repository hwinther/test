namespace WebApi.Entities;

/// <summary>
///     Represents a generic value container for value types.
/// </summary>
/// <typeparam name="T">The type of the value to be stored, which must be a value type.</typeparam>
public class GenericValue<T> where T : class
{
    /// <summary>
    ///     Gets or sets the value stored in the container.
    /// </summary>
    public required T Value { get; set; }
}