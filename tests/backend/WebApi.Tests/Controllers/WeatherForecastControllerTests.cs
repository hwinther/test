using Microsoft.AspNetCore.Mvc;
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
    public async Task Get_ReturnsOkResult()
    {
        // Act
        var result = await _controller.Get();

        // Assert
        Assert.IsType<ActionResult<IEnumerable<WeatherForecast>>>(result);
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task Get_ReturnsFiveWeatherForecasts()
    {
        // Act
        var result = await _controller.Get();

        // Assert
        Assert.NotNull(result.Result);
        var okResult = Assert.IsAssignableFrom<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
        var forecasts = Assert.IsAssignableFrom<WeatherForecast[]>(okResult.Value);
        Assert.Equal(5, forecasts.Length);
    }

    [Fact]
    public async Task Get_ReturnsWeatherForecastsWithCorrectProperties()
    {
        // Act
        var result = await _controller.Get();

        // Assert
        Assert.NotNull(result.Result);
        var okResult = Assert.IsAssignableFrom<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
        var forecasts = Assert.IsAssignableFrom<WeatherForecast[]>(okResult.Value);
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
    public async Task Get_LogsInformationMessage()
    {
        // Act
        await _controller.Get();

        // Assert
        _loggerMock.VerifyLog(LogLevel.Information, Times.Once(), "GetWeatherForecast was called");
    }
}