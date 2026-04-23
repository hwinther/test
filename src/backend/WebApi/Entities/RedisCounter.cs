namespace WebApi.Entities;

/// <summary>
///     A simple counter value stored in Redis.
/// </summary>
public class RedisCounter
{
    /// <summary>
    ///     The current counter value.
    /// </summary>
    /// <example>42</example>
    public required long Value { get; set; }
}
