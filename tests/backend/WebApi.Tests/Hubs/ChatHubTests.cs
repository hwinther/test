using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using Moq;
using WebApi.Entities;
using WebApi.Hubs;

namespace WebApi.Tests.Hubs;

public class ChatHubTests
{
    private static async Task<ChatMessage> Send(string text, params Claim[] claims)
    {
        var context = new Mock<HubCallerContext>();
        context.SetupGet(static c => c.User)
               .Returns(new ClaimsPrincipal(new ClaimsIdentity(claims, "test")));

        ChatMessage? sent = null;
        var all = new Mock<IClientProxy>();
        all.Setup(static p => p.SendCoreAsync("ReceiveMessage", It.IsAny<object?[]>(), It.IsAny<CancellationToken>()))
           .Callback<string, object?[], CancellationToken>((_, args, _) => sent = (ChatMessage) args[0]!)
           .Returns(Task.CompletedTask);
        var clients = new Mock<IHubCallerClients>();
        clients.SetupGet(static c => c.All)
               .Returns(all.Object);

        using var hub = new ChatHub();
        hub.Context = context.Object;
        hub.Clients = clients.Object;
        await hub.SendMessage(text);

        return Assert.IsType<ChatMessage>(sent);
    }

    [Fact]
    public async Task Broadcasts_the_trimmed_text_with_the_display_name_and_a_timestamp()
    {
        var before = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        var message = await Send("  hei alle  ", new Claim("name", "Hans"), new Claim("sub", "u1"));

        Assert.Equal("Hans", message.Author);
        Assert.Equal("hei alle", message.Text);
        Assert.InRange(message.Timestamp, before, DateTimeOffset.UtcNow.ToUnixTimeMilliseconds());
    }

    [Theory]
    [InlineData("preferred_username", "hcw")]
    [InlineData(ClaimTypes.Name, "Hans W")]
    [InlineData("sub", "u1")]
    public async Task Falls_back_through_the_identity_claims(string claim, string author) =>
        Assert.Equal(author, (await Send("x", new Claim(claim, author))).Author);

    [Fact]
    public async Task An_anonymous_sender_is_unknown() => Assert.Equal("Unknown", (await Send("x")).Author);
}
