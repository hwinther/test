using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using WebApi.Controllers;
using WebApi.Entities;

namespace WebApi.Tests.Controllers;

public class ServiceControllerTests
{
    private readonly Mock<ILogger<ServiceController>> _loggerMock;
    private readonly ServiceController _controller;

    public ServiceControllerTests()
    {
        _loggerMock = new Mock<ILogger<ServiceController>>();
        _controller = new ServiceController(_loggerMock.Object);
    }

    [Fact]
    public async Task Version_ReturnsOkResult()
    {
        // Act
        var result = await _controller.Version();

        // Assert
        Assert.IsType<ActionResult<VersionInformation>>(result);
        Assert.IsType<OkObjectResult>(result.Result);
        _loggerMock.VerifyLog(LogLevel.Information, Times.Once(), "Version was called");
        _loggerMock.VerifyNoError();
    }

    [Fact]
    public async Task Version_ReturnsVersionWithCorrectProperties()
    {
        // Act
        var result = await _controller.Version();

        // Assert
        Assert.NotNull(result.Result);
        var okResult = Assert.IsAssignableFrom<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
        var version = Assert.IsAssignableFrom<VersionInformation>(okResult.Value);
        Assert.IsType<string>(version.Version);
        Assert.IsType<string[]>(version.Constants);
        Assert.IsType<string>(version.EnvironmentName);
        Assert.IsType<string>(version.InformationalVersion);

        _loggerMock.VerifyLog(LogLevel.Information, Times.Once(), "Version was called");
        _loggerMock.VerifyNoError();
    }

    [Fact]
    public async Task Ping_ReturnsOkResult()
    {
        // Act
        var result = await _controller.Ping();

        // Assert
        Assert.IsType<ActionResult<GenericValue<string>>>(result);
        Assert.IsType<OkObjectResult>(result.Result);
        var okResult = (OkObjectResult) result.Result;
        Assert.NotNull(okResult.Value);
        var value = Assert.IsAssignableFrom<GenericValue<string>>(okResult.Value);
        Assert.Equal("Ok", value.Value);
        _loggerMock.VerifyLog(LogLevel.Information, Times.Once(), "Ping was called");
        _loggerMock.VerifyNoError();
    }
}