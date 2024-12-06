using System.Diagnostics.Metrics;
using Microsoft.AspNetCore.Mvc;
using WebApi.Entities;

namespace WebApi.Controllers;

/// <summary>
///     Service controller
/// </summary>
[ApiController]
[Route("[controller]")]
public class ServiceController(ILogger<ServiceController> logger) : ControllerBase
{
    private static readonly Meter ServiceMeter = new("Test.WebApi.Service", "1.0");
    private static readonly Counter<long> PingCounter = ServiceMeter.CreateCounter<long>("ping");

    /// <summary>
    ///     Returns ok
    /// </summary>
    /// <returns></returns>
    [HttpGet("ping", Name = "Ping")]
    public Task<ActionResult<GenericValue<string>>> Ping()
    {
        logger.LogInformation("Ping was called");
        PingCounter.Add(1);
        return Task.FromResult<ActionResult<GenericValue<string>>>(Ok(new GenericValue<string>
        {
            Value = "Ok"
        }));
    }

    /// <summary>
    ///     Returns version
    /// </summary>
    /// <returns></returns>
    [HttpGet("version", Name = "Version")]
    public Task<ActionResult<VersionInformation>> Version()
    {
        logger.LogInformation("Version was called");
        var versionInformation = new VersionInformation(typeof(ServiceController).Assembly);
        return Task.FromResult<ActionResult<VersionInformation>>(Ok(versionInformation));
    }
}