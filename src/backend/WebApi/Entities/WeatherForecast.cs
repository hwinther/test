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
    ///     Summary text
    /// </summary>
    public string? Summary { get; set; }
}