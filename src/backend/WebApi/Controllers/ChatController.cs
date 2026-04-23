using System.Security.Claims;
using System.Text.Json;
using System.Threading.Channels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;
using WebApi.Entities;

namespace WebApi.Controllers;

/// <summary>Real-time chat via Redis pub/sub and SSE.</summary>
[Authorize]
[ApiController]
[Route("api/v1/[controller]")]
public class ChatController(IConnectionMultiplexer redis, ILogger<ChatController> logger) : ControllerBase
{
    private static readonly RedisChannel ChatChannel = RedisChannel.Literal("chat:global");
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    /// <summary>
    ///     SSE stream — keeps the connection open and pushes chat messages as <c>data: {json}\n\n</c> events.
    /// </summary>
    [HttpGet("stream")]
    public async Task Stream(CancellationToken cancellationToken)
    {
        Response.Headers.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Append("X-Accel-Buffering", "no"); // disable nginx buffering

        var queue = Channel.CreateUnbounded<string>(new UnboundedChannelOptions { SingleReader = true });
        var subscriber = redis.GetSubscriber();

        await subscriber.SubscribeAsync(ChatChannel, (_, value) =>
        {
            if (!value.IsNullOrEmpty)
                queue.Writer.TryWrite(value!);
        });

        try
        {
            // Initial comment confirms the stream is open
            await Response.WriteAsync(": connected\n\n", cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);

            await foreach (var message in queue.Reader.ReadAllAsync(cancellationToken))
            {
                await Response.WriteAsync($"data: {message}\n\n", cancellationToken);
                await Response.Body.FlushAsync(cancellationToken);
            }
        }
        catch (OperationCanceledException)
        {
            logger.LogDebug("Chat SSE client disconnected");
        }
        finally
        {
            await subscriber.UnsubscribeAsync(ChatChannel);
            queue.Writer.TryComplete();
        }
    }

    /// <summary>Publishes a chat message. The author is taken from the JWT claims.</summary>
    /// <param name="request">Message body.</param>
    [HttpPost("messages")]
    public async Task<IResult> SendMessage([FromBody] ChatMessageRequest request)
    {
        var author = User.FindFirst("name")?.Value
            ?? User.FindFirst("preferred_username")?.Value
            ?? User.FindFirst(ClaimTypes.Name)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? "Unknown";

        var message = new ChatMessage
        {
            Author = author,
            Text = request.Text.Trim(),
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
        };

        await redis.GetSubscriber().PublishAsync(ChatChannel, JsonSerializer.Serialize(message, JsonOptions));
        return TypedResults.Ok();
    }
}
