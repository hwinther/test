using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

/// <summary>
///     Weather forecast controller
/// </summary>
[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    private static readonly string[] Summaries =
    {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };

    private readonly ILogger<WeatherForecastController> _logger;

    /// <summary>
    ///     DI constructor
    /// </summary>
    /// <param name="logger"></param>
    public WeatherForecastController(ILogger<WeatherForecastController> logger) => _logger = logger;

    /// <summary>
    ///     Returns weather forecast
    /// </summary>
    /// <returns></returns>
    [HttpGet(Name = "GetWeatherForecast")]
    public IEnumerable<WeatherForecast> Get()
    {
        return Enumerable.Range(1, 5)
                         .Select(index => new WeatherForecast
                         {
                             Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                             TemperatureC = Random.Shared.Next(-20, 55),
                             Summary = Summaries[Random.Shared.Next(Summaries.Length)]
                         })
                         .ToArray();
    }
}