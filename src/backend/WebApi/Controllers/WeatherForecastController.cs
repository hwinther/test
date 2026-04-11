using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using WebApi.Entities;

namespace WebApi.Controllers;

/// <summary>
///     Weather forecast controller
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
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
    public Ok<List<WeatherForecast>> Get()
    {
        logger.LogInformation("GetWeatherForecast was called");

        return TypedResults.Ok(Enumerable.Range(1, 5)
                                         .Select(static index => new WeatherForecast
                                         {
                                             Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                                             TemperatureC = Random.Shared.Next(-20, 55),
                                             Summary = Summaries[Random.Shared.Next(Summaries.Length)]
                                         })
                                         .ToList());
    }
}