using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Logging;
using Moq;
using StackExchange.Redis;
using WebApi.Controllers;
using WebApi.Entities;

namespace WebApi.Tests.Controllers;

public class RedisControllerTests
{
    private const string CounterKey = "service:hit-counter";
    private readonly Mock<IDatabase> _database = new();
    private readonly Mock<ILogger<RedisController>> _logger = new();
    private readonly RedisController _controller;

    public RedisControllerTests()
    {
        var redis = new Mock<IConnectionMultiplexer>();
        redis.Setup(static r => r.GetDatabase(It.IsAny<int>(), It.IsAny<object?>()))
             .Returns(_database.Object);
        _controller = new RedisController(_logger.Object, redis.Object);
    }

    [Fact]
    public async Task GetCounter_returns_the_stored_value()
    {
        _database.Setup(static d => d.StringGetAsync((RedisKey) CounterKey, It.IsAny<CommandFlags>()))
                 .ReturnsAsync((RedisValue) 41);

        var result = await _controller.GetCounter();

        Assert.Equal(41, Assert.IsType<Ok<RedisCounter>>(result).Value!.Value);
        _logger.VerifyLog(LogLevel.Information, Times.Once(), "GetCounter was called");
    }

    [Fact]
    public async Task GetCounter_is_zero_before_the_first_hit()
    {
        _database.Setup(static d => d.StringGetAsync((RedisKey) CounterKey, It.IsAny<CommandFlags>()))
                 .ReturnsAsync(RedisValue.Null);

        var result = await _controller.GetCounter();

        Assert.Equal(0, result.Value!.Value);
    }

    [Fact]
    public async Task IncrementCounter_returns_the_new_value()
    {
        _database.Setup(static d => d.StringIncrementAsync((RedisKey) CounterKey, 1, It.IsAny<CommandFlags>()))
                 .ReturnsAsync(42);

        var result = await _controller.IncrementCounter();

        Assert.Equal(42, result.Value!.Value);
        _logger.VerifyLog(LogLevel.Information, Times.Once(), "IncrementCounter was called");
    }

    [Fact]
    public async Task ResetCounter_deletes_the_key()
    {
        _database.Setup(static d => d.KeyDeleteAsync((RedisKey) CounterKey, It.IsAny<CommandFlags>()))
                 .ReturnsAsync(true);

        var result = await _controller.ResetCounter();

        Assert.Equal(0, result.Value!.Value);
        _database.Verify(static d => d.KeyDeleteAsync((RedisKey) CounterKey, It.IsAny<CommandFlags>()), Times.Once);
        _logger.VerifyLog(LogLevel.Information, Times.Once(), "ResetCounter was called");
    }
}
