namespace WebApi.Entities;

/// <summary>
///     Weather forecast model
/// </summary>
public class WeatherForecast
{
    /// <summary>
    ///     Date of forecast
    /// </summary>
    /// <example>2024.06.07</example>
    public DateOnly Date { get; set; }

    /// <summary>
    ///     Temperature in celsius
    /// </summary>
    /// <example>25</example>
    public int TemperatureC { get; set; }

    /// <summary>
    ///     Summary text
    /// </summary>
    /// <example>Sunny</example>
    public string? Summary { get; set; }
}