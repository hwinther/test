using Microsoft.AspNetCore.Mvc;
using WebApi.Entities;

namespace WebApi.Controllers;

/// <summary>
///     Weather forecast controller
/// </summary>
[ApiController]
[Route("[controller]")]
public class WeatherForecastController(ILogger<WeatherForecastController> logger) : ControllerBase
{
    private static readonly string[] Summaries =
    [
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    ];

    /// <summary>
    ///     Returns weather forecast
    /// </summary>
    /// <returns></returns>
    [HttpGet(Name = "GetWeatherForecast")]
    public Task<ActionResult<IEnumerable<WeatherForecast>>> Get()
    {
        logger.LogInformation("GetWeatherForecast was called");

        return Task.FromResult<ActionResult<IEnumerable<WeatherForecast>>>(Ok(Enumerable.Range(1, 5)
                                                                                        .Select(static index => new WeatherForecast
                                                                                        {
                                                                                            Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                                                                                            TemperatureC = Random.Shared.Next(-20, 55),
                                                                                            Summary = Summaries[Random.Shared.Next(Summaries.Length)]
                                                                                        })
                                                                                        .ToArray()));
    }
}