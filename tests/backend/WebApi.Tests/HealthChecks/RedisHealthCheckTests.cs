using Microsoft.Extensions.Diagnostics.HealthChecks;
using Moq;
using StackExchange.Redis;
using WebApi.HealthChecks;

namespace WebApi.Tests.HealthChecks;

public class RedisHealthCheckTests
{
    private static RedisHealthCheck Check(Action<Mock<IDatabase>> setup)
    {
        var database = new Mock<IDatabase>();
        setup(database);
        var redis = new Mock<IConnectionMultiplexer>();
        redis.Setup(static r => r.GetDatabase(It.IsAny<int>(), It.IsAny<object?>()))
             .Returns(database.Object);
        return new RedisHealthCheck(redis.Object);
    }

    [Fact]
    public async Task Healthy_when_redis_answers_a_ping()
    {
        var check = Check(static d => d.Setup(static x => x.PingAsync(It.IsAny<CommandFlags>()))
                                       .ReturnsAsync(TimeSpan.FromMilliseconds(1)));

        var result = await check.CheckHealthAsync(new HealthCheckContext(), TestContext.Current.CancellationToken);

        Assert.Equal(HealthStatus.Healthy, result.Status);
    }

    [Fact]
    public async Task Unhealthy_with_the_error_when_the_ping_fails()
    {
        var check = Check(static d => d.Setup(static x => x.PingAsync(It.IsAny<CommandFlags>()))
                                       .ThrowsAsync(new InvalidOperationException("no redis")));

        var result = await check.CheckHealthAsync(new HealthCheckContext(), TestContext.Current.CancellationToken);

        Assert.Equal(HealthStatus.Unhealthy, result.Status);
        Assert.Equal("no redis", result.Description);
    }
}
