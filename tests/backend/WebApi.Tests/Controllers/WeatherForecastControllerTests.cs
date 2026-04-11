using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Logging;
using Moq;
using WebApi.Controllers;
using WebApi.Entities;

namespace WebApi.Tests.Controllers;

public class WeatherForecastControllerTests
{
    private readonly Mock<ILogger<WeatherForecastController>> _loggerMock;
    private readonly WeatherForecastController _controller;

    public WeatherForecastControllerTests()
    {
        _loggerMock = new Mock<ILogger<WeatherForecastController>>();
        _controller = new WeatherForecastController(_loggerMock.Object);
    }

    [Fact]
    public void Get_ReturnsOkResult()
    {
        // Act
        var result = _controller.Get();

        // Assert
        Assert.IsType<Ok<List<WeatherForecast>>>(result);
    }

    [Fact]
    public void Get_ReturnsFiveWeatherForecasts()
    {
        // Act
        var result = _controller.Get();

        // Assert
        var ok = Assert.IsType<Ok<List<WeatherForecast>>>(result);
        Assert.NotNull(ok.Value);
        Assert.Equal(5, ok.Value.Count);
    }

    [Fact]
    public void Get_ReturnsWeatherForecastsWithCorrectProperties()
    {
        // Act
        var result = _controller.Get();

        // Assert
        var ok = Assert.IsType<Ok<List<WeatherForecast>>>(result);
        Assert.NotNull(ok.Value);
        var forecasts = ok.Value;
        var expectedValueRange = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        foreach (var weatherForecast in forecasts)
        {
            Assert.IsType<DateOnly>(weatherForecast.Date);
            Assert.IsType<int>(weatherForecast.TemperatureC);
            Assert.InRange(weatherForecast.TemperatureC, -18, 55);
            Assert.IsType<string>(weatherForecast.Summary);
            Assert.Contains(weatherForecast.Summary, expectedValueRange);
        }
    }

    [Fact]
    public void Get_LogsInformationMessage()
    {
        // Act
        _controller.Get();

        // Assert
        _loggerMock.VerifyLog(LogLevel.Information, Times.Once(), "GetWeatherForecast was called");
    }
}
