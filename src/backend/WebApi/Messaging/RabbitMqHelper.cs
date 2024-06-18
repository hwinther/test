// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

using System.Diagnostics;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Utils.Messaging;

/// <summary>
///     TODO
/// </summary>
public static class RabbitMqHelper
{
    /// <summary>
    ///     TODO
    /// </summary>
    public const string DefaultExchangeName = "";

    /// <summary>
    ///     TODO
    /// </summary>
    public const string TestQueueName = "TestQueue";

    private static readonly ConnectionFactory ConnectionFactory;

    static RabbitMqHelper() =>
        ConnectionFactory = new ConnectionFactory
        {
            HostName = Environment.GetEnvironmentVariable("RABBITMQ_HOSTNAME") ?? "localhost",
            UserName = Environment.GetEnvironmentVariable("RABBITMQ_DEFAULT_USER") ?? "guest",
            Password = Environment.GetEnvironmentVariable("RABBITMQ_DEFAULT_PASS") ?? "guest",
            Port = 5672,
            RequestedConnectionTimeout = TimeSpan.FromMilliseconds(3000)
        };

    /// <summary>
    ///     TODO
    /// </summary>
    /// <returns></returns>
    public static IConnection CreateConnection() => ConnectionFactory.CreateConnection();

    /// <summary>
    ///     TODO
    /// </summary>
    public static IModel CreateModelAndDeclareTestQueue(IConnection connection)
    {
        var channel = connection.CreateModel();

        channel.QueueDeclare(
            TestQueueName,
            false,
            false,
            false,
            null);

        return channel;
    }

    /// <summary>
    ///     TODO
    /// </summary>
    public static void StartConsumer(IModel channel, Action<BasicDeliverEventArgs> processMessage)
    {
        var consumer = new EventingBasicConsumer(channel);

        consumer.Received += (bc, ea) => processMessage(ea);

        channel.BasicConsume(TestQueueName, true, consumer);
    }

    /// <summary>
    ///     TODO
    /// </summary>
    public static void AddMessagingTags(Activity activity)
    {
        // These tags are added demonstrating the semantic conventions of the OpenTelemetry messaging specification
        // See:
        //   * https://github.com/open-telemetry/semantic-conventions/blob/main/docs/messaging/messaging-spans.md#messaging-attributes
        //   * https://github.com/open-telemetry/semantic-conventions/blob/main/docs/messaging/rabbitmq.md
        activity?.SetTag("messaging.system", "rabbitmq");
        activity?.SetTag("messaging.destination_kind", "queue");
        activity?.SetTag("messaging.destination", DefaultExchangeName);
        activity?.SetTag("messaging.rabbitmq.routing_key", TestQueueName);
    }
}