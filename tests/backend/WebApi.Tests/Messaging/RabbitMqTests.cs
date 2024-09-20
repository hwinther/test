using System.Diagnostics;
using Microsoft.Extensions.Logging;
using Moq;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Testcontainers.RabbitMq;
using WebApi.Messaging;

namespace WebApi.Tests.Messaging;

[TestFixture]
public class RabbitMqTests
{
    [OneTimeSetUp]
    public async Task InitializeAsync()
    {
        await _rabbitMqContainer.StartAsync();
        _unitTestActivity = new Activity(nameof(RabbitMqTests));
    }

    [OneTimeTearDown]
    public async Task DisposeAsync()
    {
        await _rabbitMqContainer.DisposeAsync();
        _unitTestActivity.Stop();
        _unitTestActivity.Dispose();
    }

    private readonly RabbitMqContainer _rabbitMqContainer = new RabbitMqBuilder().Build();
    private Activity _unitTestActivity;

    [Test]
    [Order(1)]
    public void IsOpen_ReturnsTrue()
    {
        // Given
        var connectionFactory = new ConnectionFactory
        {
            Uri = new Uri(_rabbitMqContainer.GetConnectionString())
        };

        // When
        using var connection = connectionFactory.CreateConnection();

        // Then
        Assert.That(connection.IsOpen);
    }

    [Test]
    [Order(2)]
    public void MessageSender_SendsMessage()
    {
        // Given
        var connectionFactory = new ConnectionFactory
        {
            Uri = new Uri(_rabbitMqContainer.GetConnectionString())
        };

        Environment.SetEnvironmentVariable("RABBITMQ_HOSTNAME", connectionFactory.HostName);
        Environment.SetEnvironmentVariable("RABBITMQ_PORT", connectionFactory.Port.ToString());
        Environment.SetEnvironmentVariable("RABBITMQ_DEFAULT_USER", connectionFactory.UserName);
        Environment.SetEnvironmentVariable("RABBITMQ_DEFAULT_PASS", connectionFactory.Password);
        var messageSenderLogger = new Mock<ILogger<MessageSender>>();
        using var messageSender = new MessageSender(messageSenderLogger.Object);
        var messageReceiverLogger = new Mock<ILogger<MessageReceiver>>();
        using var messageReceiver = new MessageReceiver(messageReceiverLogger.Object);

        // When
        messageSender.SendMessage();
        messageReceiver.ReceiveMessage(new BasicDeliverEventArgs());

        // Then
        messageSenderLogger.VerifyLog(LogLevel.Information, Times.Once(), "Message sent:");

        messageSenderLogger.VerifyLog(LogLevel.Error, Times.Never(), ".*");

        messageReceiverLogger.VerifyLog(LogLevel.Information, Times.Once(), "Message received:");

        messageReceiverLogger.VerifyLog(LogLevel.Error, Times.Never(), ".*");
    }
}