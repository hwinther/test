using Microsoft.AspNetCore.Mvc;
using Moq;
using WebApi.Controllers;
using WebApi.Entities;
using WebApi.Messaging;

namespace WebApi.Tests.Controllers;

public class SendMessageControllerTests
{
    private readonly Mock<IMessageSender> _messageSenderMock;
    private readonly SendMessageController _controller;

    public SendMessageControllerTests()
    {
        _messageSenderMock = new Mock<IMessageSender>();
        _controller = new SendMessageController(_messageSenderMock.Object);
    }

    [Fact]
    public async Task Get_ReturnsOkResult()
    {
        // Arrange
        _messageSenderMock.Setup(static messageSender => messageSender.SendMessageAsync())
                          .ReturnsAsync("Message sent");

        // Act
        var result = await _controller.Get();

        // Assert
        Assert.IsType<ActionResult<GenericValue<string>>>(result);
        Assert.IsType<OkObjectResult>(result.Result);
        var okResult = (OkObjectResult) result.Result;
        Assert.NotNull(okResult.Value);
        var value = Assert.IsAssignableFrom<GenericValue<string>>(okResult.Value);
        Assert.Equal("Message sent", value.Value);
    }
}