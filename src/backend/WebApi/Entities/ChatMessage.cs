namespace WebApi.Entities;

/// <summary>A chat message broadcast via the SignalR hub.</summary>
public record ChatMessage
{
    /// <summary>Display name of the sender (from JWT claims).</summary>
    public required string Author { get; init; }

    /// <summary>Message body.</summary>
    public required string Text { get; init; }

    /// <summary>Unix timestamp in milliseconds (UTC).</summary>
    public required long Timestamp { get; init; }
}
