using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using WebApi.Controllers;
using WebApi.Entities;

namespace WebApi.Tests.Controllers;

[TestFixture]
public class ServiceControllerTests
{
    [SetUp]
    public void SetUp()
    {
        _loggerMock = new Mock<ILogger<ServiceController>>();
        _controller = new ServiceController(_loggerMock.Object);
    }
    private Mock<ILogger<ServiceController>> _loggerMock;
    private ServiceController _controller;

    [Test]
    public async Task Version_ReturnsOkResult()
    {
        // Act
        var result = await _controller.Version();

        // Assert
        Assert.That(result, Is.InstanceOf<ActionResult<VersionInformation>>());
        Assert.That(result.Result, Is.InstanceOf<OkObjectResult>());
    }

    [Test]
    public async Task Version_ReturnsVersionWithCorrectProperties()
    {
        // Act
        var result = await _controller.Version();

        // Assert
        Assert.That(result.Result, Is.Not.Null);
        Assert.That(result.Result, Is.AssignableFrom<OkObjectResult>());
        var okResult = (OkObjectResult) result.Result;
        Assert.That(okResult.Value, Is.Not.Null);
        Assert.That(okResult.Value, Is.AssignableFrom<VersionInformation>());
        var version = okResult.Value as VersionInformation;
        Assert.That(version, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(version.Version, Is.InstanceOf<string>());
            Assert.That(version.Constants, Is.InstanceOf<string[]>());
            Assert.That(version.EnvironmentName, Is.InstanceOf<string>());
            Assert.That(version.InformationalVersion, Is.InstanceOf<string>());
        });
    }

    [Test]
    public async Task Ping_ReturnsOkResult()
    {
        // Act
        var result = await _controller.Ping();

        // Assert
        Assert.That(result, Is.InstanceOf<ActionResult<GenericValue<string>>>());
        Assert.That(result.Result, Is.InstanceOf<OkObjectResult>());
        var okResult = (OkObjectResult) result.Result;
        Assert.That(okResult.Value, Is.Not.Null);
        Assert.That(okResult.Value, Is.AssignableFrom<GenericValue<string>>());
        Assert.That(okResult.Value is GenericValue<string> {Value: "Ok"});
    }

    [Test]
    public async Task Ping_LogsInformationMessage()
    {
        // Act
        await _controller.Ping();

        // Assert
        _loggerMock.Verify(static logger => logger.Log(
                               It.Is<LogLevel>(static logLevel => logLevel == LogLevel.Information),
                               It.Is<EventId>(static eventId => eventId.Id == 0),
                               It.Is<It.IsAnyType>(static (@object, type) => @object.ToString() == "Ping was called" && type.Name == "FormattedLogValues"),
                               It.IsAny<Exception>(),
                               It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
                           Times.Once);
    }
}