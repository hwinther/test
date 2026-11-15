using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using RabbitMQ.Client;
using StackExchange.Redis;
using WebApi.Controllers;
using WebApi.Database;
using WebApi.Entities;
using WebApi.Messaging;

namespace WebApi.Tests.Controllers;

/// <summary>The status endpoint, with every downstream service stubbed or unreachable.</summary>
public class ServiceControllerStatusTests
{
    private readonly ServiceController _controller = new(new Mock<ILogger<ServiceController>>().Object);

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private static Mock<IRabbitMqConnectionFactory> RabbitMq(bool open)
    {
        var connection = new Mock<IConnection>();
        connection.SetupGet(static c => c.IsOpen)
                  .Returns(open);
        var factory = new Mock<IRabbitMqConnectionFactory>();
        factory.Setup(static f => f.CreateConnectionAsync())
               .ReturnsAsync(connection.Object);
        return factory;
    }

    private static Mock<IConnectionMultiplexer> Redis(Exception? failure = null)
    {
        var database = new Mock<IDatabase>();
        var ping = database.Setup(static d => d.PingAsync(It.IsAny<CommandFlags>()));
        if (failure is null)
            ping.ReturnsAsync(TimeSpan.FromMilliseconds(1));
        else
            ping.ThrowsAsync(failure);

        var redis = new Mock<IConnectionMultiplexer>();
        redis.Setup(static r => r.GetDatabase(It.IsAny<int>(), It.IsAny<object?>()))
             .Returns(database.Object);
        return redis;
    }

    // Port 1 on loopback refuses at once, so the check fails fast without a server.
    private static BloggingContext UnreachablePostgres() =>
        new(new DbContextOptionsBuilder<BloggingContext>()
            .UseNpgsql("Host=127.0.0.1;Port=1;Timeout=2;Database=blogging;Username=x;Password=x")
            .Options);

    [Fact]
    public async Task Reports_what_is_not_configured()
    {
        var result = await _controller.Status(null, RabbitMq(true).Object, null, Ct);

        var status = Assert.IsType<Ok<ServiceStatus>>(result).Value!;
        Assert.False(status.Postgres.Connected);
        Assert.Equal("Not configured", status.Postgres.Error);
        Assert.True(status.RabbitMq.Connected);
        Assert.False(status.Redis.Connected);
        Assert.Equal("Not configured", status.Redis.Error);
    }

    [Fact]
    public async Task Reports_connected_services_and_failures()
    {
        var rabbit = new Mock<IRabbitMqConnectionFactory>();
        rabbit.Setup(static f => f.CreateConnectionAsync())
              .ThrowsAsync(new InvalidOperationException("broker down"));
        await using var postgres = UnreachablePostgres();

        var result = await _controller.Status(postgres, rabbit.Object, Redis().Object, Ct);

        var status = result.Value!;
        Assert.False(status.Postgres.Connected);
        Assert.False(status.RabbitMq.Connected);
        Assert.Equal("broker down", status.RabbitMq.Error);
        Assert.True(status.Redis.Connected);
        Assert.Null(status.Redis.Error);
    }

    [Fact]
    public async Task Reports_the_errors_of_a_failing_check()
    {
        await using var postgres = UnreachablePostgres();
        using var cancelled = new CancellationTokenSource();
        await cancelled.CancelAsync();

        var result = await _controller.Status(postgres, RabbitMq(false).Object,
                                              Redis(new InvalidOperationException("no redis")).Object,
                                              cancelled.Token);

        var status = result.Value!;
        Assert.False(status.Postgres.Connected);
        Assert.NotNull(status.Postgres.Error);
        Assert.False(status.RabbitMq.Connected);
        Assert.False(status.Redis.Connected);
        Assert.Equal("no redis", status.Redis.Error);
    }
}
