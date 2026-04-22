using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;
using WebApi.Entities;

namespace WebApi.Controllers;

/// <summary>
///     Redis controller
/// </summary>
[Authorize]
[ApiController]
[Route("api/v1/[controller]")]
public class RedisController(ILogger<RedisController> logger, IConnectionMultiplexer redis) : ControllerBase
{
    private const string CounterKey = "service:hit-counter";

    /// <summary>
    ///     Returns the current hit counter value.
    /// </summary>
    [HttpGet("counter", Name = "GetCounter")]
    public async Task<Ok<RedisCounter>> GetCounter()
    {
        logger.LogInformation("GetCounter was called");
        var value = await redis.GetDatabase().StringGetAsync(CounterKey);
        return TypedResults.Ok(new RedisCounter { Value = value.HasValue ? (long)value : 0 });
    }

    /// <summary>
    ///     Increments the hit counter and returns the new value.
    /// </summary>
    [HttpPost("counter", Name = "IncrementCounter")]
    public async Task<Ok<RedisCounter>> IncrementCounter()
    {
        logger.LogInformation("IncrementCounter was called");
        var newValue = await redis.GetDatabase().StringIncrementAsync(CounterKey);
        return TypedResults.Ok(new RedisCounter { Value = newValue });
    }

    /// <summary>
    ///     Resets the hit counter to zero.
    /// </summary>
    [HttpDelete("counter", Name = "ResetCounter")]
    public async Task<Ok<RedisCounter>> ResetCounter()
    {
        logger.LogInformation("ResetCounter was called");
        await redis.GetDatabase().KeyDeleteAsync(CounterKey);
        return TypedResults.Ok(new RedisCounter { Value = 0 });
    }
}
