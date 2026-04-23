using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using WebApi.Entities;

namespace WebApi.Hubs;

/// <summary>SignalR hub for real-time chat. Messages fan out via the Redis backplane.</summary>
[Authorize]
public class ChatHub : Hub
{
    /// <summary>
    ///     Receives a message from a connected client, stamps it with the sender's identity and
    ///     a UTC timestamp, then broadcasts it to every connected client.
    /// </summary>
    /// <param name="text">Raw message text from the client.</param>
    public async Task SendMessage(string text)
    {
        var author = Context.User?.FindFirst("name")?.Value
            ?? Context.User?.FindFirst("preferred_username")?.Value
            ?? Context.User?.FindFirst(ClaimTypes.Name)?.Value
            ?? Context.User?.FindFirst("sub")?.Value
            ?? "Unknown";

        var message = new ChatMessage
        {
            Author = author,
            Text = text.Trim(),
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
        };

        await Clients.All.SendAsync("ReceiveMessage", message);
    }
}
