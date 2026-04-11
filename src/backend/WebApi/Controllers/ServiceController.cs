using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using WebApi.Entities;

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
}