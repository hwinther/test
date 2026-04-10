using Microsoft.AspNetCore.Http.HttpResults;
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
        var ok = Assert.IsType<Ok<GenericValue<string>>>(result);
        Assert.NotNull(ok.Value);
        Assert.Equal("Message sent", ok.Value.Value);
    }
}
