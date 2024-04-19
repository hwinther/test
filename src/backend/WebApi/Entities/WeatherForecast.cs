namespace WebApi.Entities;

/// <summary>
///     Weather forecast model
/// </summary>
public class WeatherForecast
{
    /// <summary>
    ///     Date of forecast
    /// </summary>
    public DateOnly Date { get; set; }

    /// <summary>
    ///     Temperature in celsius
    /// </summary>
    public int TemperatureC { get; set; }

    /// <summary>
    ///     Temperature in fahrenheit
    /// </summary>
    public int TemperatureF => 32 + (int) (TemperatureC / 0.5556);

    /// <summary>
    ///     Summary text
    /// </summary>
    public string? Summary { get; set; }
}