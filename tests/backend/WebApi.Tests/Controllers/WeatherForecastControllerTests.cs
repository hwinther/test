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
        Assert.IsInstanceOf<ActionResult<IEnumerable<WeatherForecast>>>(result);
        Assert.IsInstanceOf<OkObjectResult>(result.Result);
    }

    [Test]
    public async Task Get_ReturnsFiveWeatherForecasts()
    {
        // Act
        var result = await _controller.Get();

        // Assert
        Assert.NotNull(result.Result);
        Assert.IsAssignableFrom<OkObjectResult>(result.Result);
        var okResult = (OkObjectResult) result.Result;
        Assert.NotNull(okResult.Value);
        Assert.IsAssignableFrom<WeatherForecast[]>(okResult.Value);
        Assert.That(((WeatherForecast[]) okResult.Value).Count(), Is.EqualTo(5));
    }

    [Test]
    public async Task Get_ReturnsWeatherForecastsWithCorrectProperties()
    {
        // Act
        var result = await _controller.Get();

        // Assert
        Assert.NotNull(result.Result);
        Assert.IsAssignableFrom<OkObjectResult>(result.Result);
        var okResult = (OkObjectResult) result.Result;
        Assert.NotNull(okResult.Value);
        Assert.IsAssignableFrom<WeatherForecast[]>(okResult.Value);
        foreach (var weatherForecast in (WeatherForecast[]) okResult.Value)
        {
            Assert.IsInstanceOf<DateOnly>(weatherForecast.Date);
            Assert.IsInstanceOf<int>(weatherForecast.TemperatureC);
            Assert.IsInstanceOf<string>(weatherForecast.Summary);
        }
    }

    [Test]
    public async Task Get_LogsInformationMessage()
    {
        // Act
        await _controller.Get();

        // Assert
        _loggerMock.Verify(static x => x.LogInformation(It.IsAny<string>()), Times.Once);
    }
}

/*using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using WebApi.Controllers;
using WebApi.Entities;

namespace WebApi.Tests.Controllers;

public class WeatherForecastControllerTests
{
private ILogger<WeatherForecastController> _logger;
private WeatherForecastController _controller;

[SetUp]
public void Setup()
{
    _logger = Mock.Of<ILogger<WeatherForecastController>>();
    _controller = new WeatherForecastController(_logger);
}

[Test]
public async Task Get_ReturnsExpectedWeatherForecast()
{
    // Act
    var result = await _controller.Get();

    // Assert
    Assert.IsInstanceOf<ActionResult<IEnumerable<WeatherForecast>>>(result);
    Assert.IsInstanceOf<IEnumerable<WeatherForecast>>(result.Value);
    Assert.IsNotNull(result.Value);
    Assert.That(((IEnumerable<WeatherForecast>) result.Value).Count(), Is.EqualTo(5));

    foreach (var weatherForecast in result.Value)
    {
        Assert.IsInstanceOf<DateOnly>(weatherForecast.Date);
        Assert.IsInstanceOf<int>(weatherForecast.TemperatureC);
        Assert.IsInstanceOf<string>(weatherForecast.Summary);
    }

    //Mock.Get(_logger).Verify(static x => x.Log<>(It.IsAny<ILogger>(), It.IsAny<LogLevel>(), default, default), Times.Once());
}
}*/