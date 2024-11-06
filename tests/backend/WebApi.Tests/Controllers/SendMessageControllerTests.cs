using Microsoft.AspNetCore.Mvc;
using Moq;
using WebApi.Controllers;
using WebApi.Entities;
using WebApi.Messaging;

namespace WebApi.Tests.Controllers;

[TestFixture]
public class SendMessageControllerTests
{
    [SetUp]
    public void SetUp()
    {
        _messageSenderMock = new Mock<IMessageSender>();
        _controller = new SendMessageController(_messageSenderMock.Object);
    }
    private Mock<IMessageSender> _messageSenderMock;
    private SendMessageController _controller;

    [Test]
    public async Task Get_ReturnsOkResult()
    {
        // Arrange
        _messageSenderMock.Setup(static messageSender => messageSender.SendMessageAsync())
                          .ReturnsAsync("Message sent");

        // Act
        var result = await _controller.Get();

        // Assert
        Assert.That(result, Is.InstanceOf<ActionResult<GenericValue<string>>>());
        Assert.That(result.Result, Is.InstanceOf<OkObjectResult>());
        var okResult = (OkObjectResult) result.Result;
        Assert.That(okResult.Value, Is.Not.Null);
        Assert.That(okResult.Value, Is.AssignableFrom<GenericValue<string>>());
        Assert.That(okResult.Value is GenericValue<string> {Value: "Message sent"});
    }
}