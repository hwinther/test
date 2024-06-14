using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using WebApi.Controllers;
using WebApi.Entities;

namespace WebApi.Tests.Controllers;

[TestFixture]
public class WeatherForecastControllerTests
{
    [SetUp]
    public void SetUp()
    {
        _loggerMock = new Mock<ILogger<WeatherForecastController>>();
        _controller = new WeatherForecastController(_loggerMock.Object);
    }
    private Mock<ILogger<WeatherForecastController>> _loggerMock;
    private WeatherForecastController _controller;

    [Test]
    public async Task Get_ReturnsOkResult()
    {
        // Act
        var result = await _controller.Get();

        // Assert
        Assert.That(result, Is.InstanceOf<ActionResult<IEnumerable<WeatherForecast>>>());
        Assert.That(result.Result, Is.InstanceOf<OkObjectResult>());
    }

    [Test]
    public async Task Get_ReturnsFiveWeatherForecasts()
    {
        // Act
        var result = await _controller.Get();

        // Assert
        Assert.That(result.Result, Is.Not.Null);
        Assert.That(result.Result, Is.AssignableFrom<OkObjectResult>());
        var okResult = (OkObjectResult) result.Result;
        Assert.That(okResult.Value, Is.Not.Null);
        Assert.That(okResult.Value, Is.AssignableFrom<WeatherForecast[]>());
        Assert.That(((WeatherForecast[]) okResult.Value).Count(), Is.EqualTo(5));
    }

    [Test]
    public async Task Get_ReturnsWeatherForecastsWithCorrectProperties()
    {
        // Act
        var result = await _controller.Get();

        // Assert
        Assert.That(result.Result, Is.Not.Null);
        Assert.That(result.Result, Is.AssignableFrom<OkObjectResult>());
        var okResult = (OkObjectResult) result.Result;
        Assert.That(okResult.Value, Is.Not.Null);
        Assert.That(okResult.Value, Is.AssignableFrom<WeatherForecast[]>());
        foreach (var weatherForecast in (WeatherForecast[]) okResult.Value)
        {
            Assert.That(weatherForecast.Date, Is.InstanceOf<DateOnly>());
            Assert.That(weatherForecast.TemperatureC, Is.InstanceOf<int>());
            Assert.That(weatherForecast.Summary, Is.InstanceOf<string>());
        }
    }

    //[Test]
    //public async Task Get_LogsInformationMessage()
    //{
    //    // Act
    //    await _controller.Get();

    //    // Assert
    //    _loggerMock.Verify(static x => x.LogInformation(It.IsAny<string>()), Times.Once);
    //}
}