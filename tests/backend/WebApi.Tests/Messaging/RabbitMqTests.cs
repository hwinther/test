using System.Diagnostics;
using Microsoft.Extensions.Logging;
using Moq;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Testcontainers.RabbitMq;
using WebApi.Messaging;

namespace WebApi.Tests.Messaging;

[Collection("RabbitMq")]
public class RabbitMqTests : IAsyncLifetime, IAsyncDisposable
{
    private readonly RabbitMqContainer _rabbitMqContainer = new RabbitMqBuilder("rabbitmq:4.2-management-alpine").Build();
    private Activity _unitTestActivity = null!;

    public async ValueTask InitializeAsync()
    {
        await _rabbitMqContainer.StartAsync();
        _unitTestActivity = new Activity(nameof(RabbitMqTests));
    }

    public async ValueTask DisposeAsync()
    {
        await _rabbitMqContainer.DisposeAsync();
        _unitTestActivity.Stop();
        _unitTestActivity.Dispose();
    }

    [Fact]
    public async Task IsOpen_ReturnsTrue()
    {
        // Given
        var connectionFactory = new ConnectionFactory
        {
            Uri = new Uri(_rabbitMqContainer.GetConnectionString())
        };

        // When
        await using var connection = await connectionFactory.CreateConnectionAsync(TestContext.Current.CancellationToken);

        // Then
        Assert.True(connection.IsOpen);
    }

    [Fact]
    public async Task MessageSender_SendsMessage()
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
        await messageSender.SendMessageAsync();
        await messageReceiver.ReceiveMessageAsync(new BasicDeliverEventArgs("consumerTag", ulong.MinValue, false, "exchange", "channel", new BasicProperties(), ReadOnlyMemory<byte>.Empty));

        // Then
        messageSenderLogger.VerifyLog(LogLevel.Information, Times.Once(), "Message sent:");

        messageSenderLogger.VerifyLog(LogLevel.Error, Times.Never(), ".*");

        messageReceiverLogger.VerifyLog(LogLevel.Information, Times.Once(), "Message received:");

        messageReceiverLogger.VerifyLog(LogLevel.Error, Times.Never(), ".*");
    }
}
