using Microsoft.AspNetCore.Http.HttpResults;
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
        Assert.IsType<Ok<VersionInformation>>(result);
        _loggerMock.VerifyLog(LogLevel.Information, Times.Once(), "Version was called");
        _loggerMock.VerifyNoError();
    }

    [Fact]
    public async Task Version_ReturnsVersionWithCorrectProperties()
    {
        // Act
        var result = await _controller.Version();

        // Assert
        var ok = Assert.IsType<Ok<VersionInformation>>(result);
        Assert.NotNull(ok.Value);
        var version = ok.Value;
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
        var ok = Assert.IsType<Ok<GenericValue<string>>>(result);
        Assert.NotNull(ok.Value);
        Assert.Equal("Ok", ok.Value.Value);
        _loggerMock.VerifyLog(LogLevel.Information, Times.Once(), "Ping was called");
        _loggerMock.VerifyNoError();
    }
}