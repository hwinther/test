using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using WebApi.Database;
using WebApi.Entities;
using WebApi.Messaging;

namespace WebApi.Controllers;

/// <summary>
///     Service controller
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public class ServiceController(ILogger<ServiceController> logger) : ControllerBase
{
    /// <summary>
    ///     Returns ok
    /// </summary>
    /// <returns></returns>
    [HttpGet("ping", Name = "Ping")]
    public Task<Ok<GenericValue<string>>> Ping()
    {
        logger.LogInformation("Ping was called");
        return Task.FromResult(TypedResults.Ok(new GenericValue<string>
        {
            Value = "Ok"
        }));
    }

    /// <summary>
    ///     Returns version
    /// </summary>
    /// <returns></returns>
    [HttpGet("version", Name = "Version")]
    public Task<Ok<VersionInformation>> Version()
    {
        logger.LogInformation("Version was called");
        var versionInformation = new VersionInformation(typeof(ServiceController).Assembly);
        return Task.FromResult(TypedResults.Ok(versionInformation));
    }

    /// <summary>
    ///     Returns the connection status of downstream services (PostgreSQL and RabbitMQ).
    /// </summary>
    /// <returns></returns>
    [HttpGet("status", Name = "Status")]
    public async Task<Ok<ServiceStatus>> Status(
        [FromServices] BloggingContext? bloggingContext,
        [FromServices] IRabbitMqConnectionFactory rabbitMqConnectionFactory,
        CancellationToken cancellationToken)
    {
        logger.LogInformation("Status was called");

        var postgresTask = CheckPostgresAsync(bloggingContext, cancellationToken);
        var rabbitMqTask = CheckRabbitMqAsync(rabbitMqConnectionFactory);

        await Task.WhenAll(postgresTask, rabbitMqTask);

        return TypedResults.Ok(new ServiceStatus
        {
            Postgres = postgresTask.Result,
            RabbitMq = rabbitMqTask.Result,
        });
    }

    private static async Task<ConnectionStatus> CheckPostgresAsync(BloggingContext? context, CancellationToken cancellationToken)
    {
        if (context is null)
            return new ConnectionStatus { Connected = false, Error = "Not configured" };

        try
        {
            var canConnect = await context.Database.CanConnectAsync(cancellationToken);
            return new ConnectionStatus { Connected = canConnect };
        }
        catch (Exception ex)
        {
            return new ConnectionStatus { Connected = false, Error = ex.Message };
        }
    }

    private static async Task<ConnectionStatus> CheckRabbitMqAsync(IRabbitMqConnectionFactory factory)
    {
        try
        {
            await using var connection = await factory.CreateConnectionAsync();
            return new ConnectionStatus { Connected = connection.IsOpen };
        }
        catch (Exception ex)
        {
            return new ConnectionStatus { Connected = false, Error = ex.Message };
        }
    }
}