using System.Diagnostics;
using Microsoft.Extensions.Logging;
using Moq;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using RabbitMQ.Client.Exceptions;
using WebApi.Messaging;
using WebApi.Options;
using MsOptions = Microsoft.Extensions.Options.Options;

namespace WebApi.Tests.Messaging;

/// <summary>RabbitMQ helpers and the connection factory, without a broker (see RabbitMqTests for those).</summary>
public class RabbitMqUnitTests
{
    [Fact]
    public async Task CreateModelAndDeclareTestQueue_declares_the_test_queue_on_a_new_channel()
    {
        var channel = new Mock<IChannel>();
        var connection = new Mock<IConnection>();
        connection.Setup(static c => c.CreateChannelAsync(It.IsAny<CreateChannelOptions?>(), It.IsAny<CancellationToken>()))
                  .ReturnsAsync(channel.Object);

        var created = await RabbitMqHelper.CreateModelAndDeclareTestQueueAsync(connection.Object);

        Assert.Same(channel.Object, created);
        channel.Verify(static c => c.QueueDeclareAsync(RabbitMqHelper.TestQueueName, false, false, false,
                                                       It.IsAny<IDictionary<string, object?>?>(), It.IsAny<bool>(),
                                                       It.IsAny<bool>(), It.IsAny<CancellationToken>()),
                       Times.Once);
    }

    [Fact]
    public async Task StartConsumer_hands_each_delivery_to_the_callback()
    {
        var channel = new Mock<IChannel>();
        IAsyncBasicConsumer? consumer = null;
        channel.Setup(static c => c.BasicConsumeAsync(RabbitMqHelper.TestQueueName, true, It.IsAny<string>(), It.IsAny<bool>(),
                                                      It.IsAny<bool>(), It.IsAny<IDictionary<string, object?>?>(),
                                                      It.IsAny<IAsyncBasicConsumer>(), It.IsAny<CancellationToken>()))
               .Callback<string, bool, string, bool, bool, IDictionary<string, object?>?, IAsyncBasicConsumer, CancellationToken>(
                   (_, _, _, _, _, _, c, _) => consumer = c)
               .ReturnsAsync("ctag");
        var received = new List<string>();

        await RabbitMqHelper.StartConsumerAsync(channel.Object, ea =>
        {
            received.Add(ea.RoutingKey);
            return Task.CompletedTask;
        });

        Assert.NotNull(consumer);
        await consumer.HandleBasicDeliverAsync("ctag", 1, false, "", RabbitMqHelper.TestQueueName,
                                               new BasicProperties(), ReadOnlyMemory<byte>.Empty,
                                               TestContext.Current.CancellationToken);
        Assert.Equal([RabbitMqHelper.TestQueueName], received);
    }

    [Fact]
    public void AddMessagingTags_sets_the_messaging_semantic_conventions()
    {
        using var activity = new Activity("send");

        RabbitMqHelper.AddMessagingTags(activity);

        Assert.Equal("rabbitmq", activity.GetTagItem("messaging.system"));
        Assert.Equal("queue", activity.GetTagItem("messaging.destination_kind"));
        Assert.Equal("", activity.GetTagItem("messaging.destination"));
        Assert.Equal(RabbitMqHelper.TestQueueName, activity.GetTagItem("messaging.rabbitmq.routing_key"));
    }

    [Theory]
    [InlineData("127.0.0.1", false)]
    [InlineData("rabbitmq.messaging.svc.invalid", true)]
    public async Task A_failed_connection_is_logged_and_rethrown(string host, bool inCluster)
    {
        var logger = new Mock<ILogger<RabbitMqConnectionFactory>>();
        var factory = new RabbitMqConnectionFactory(MsOptions.Create(new RabbitMqOptions
        {
            // Port 1 on loopback refuses at once; the .svc. name does not resolve.
            HostName = $"  {host} ",
            Port = 1,
            UserName = " guest ",
            Password = "guest\n",
            VirtualHost = "  "
        }), logger.Object);

        await Assert.ThrowsAnyAsync<BrokerUnreachableException>(factory.CreateConnectionAsync);

        logger.VerifyLog(LogLevel.Warning, Times.Once(), $"RabbitMQ connection failed \\(host {host.Replace(".", "\\.")}, port 1, virtual host /, user guest\\)");
        logger.VerifyLog(LogLevel.Warning, inCluster ? Times.Once() : Times.Never(), "in-cluster Kubernetes DNS");
        logger.VerifyLog(LogLevel.Warning, Times.Never(), "Authentication was refused");
    }
}
