// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

using System.Diagnostics;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace WebApi.Messaging;

/// <summary>
///     Provides helper methods for working with RabbitMQ, including creating connections, declaring queues, and starting
///     consumers.
///     This class abstracts some of the common setup and configuration tasks associated with using RabbitMQ in .NET
///     applications.
/// </summary>
public static class RabbitMqHelper
{
    /// <summary>
    ///     The default exchange name used when none is specified. This is typically used for direct message delivery to
    ///     queues.
    /// </summary>
    public const string DefaultExchangeName = "";

    /// <summary>
    ///     The name of the test queue used for demonstration and testing purposes.
    /// </summary>
    public const string TestQueueName = "TestQueue";

    /// <summary>
    ///     A static instance of the RabbitMQ ConnectionFactory, configured with environment variables or default values.
    /// </summary>
    private static readonly ConnectionFactory ConnectionFactory = new()
    {
        HostName = Environment.GetEnvironmentVariable("RABBITMQ_HOSTNAME") ?? "localhost",
        UserName = Environment.GetEnvironmentVariable("RABBITMQ_DEFAULT_USER") ?? "guest",
        Password = Environment.GetEnvironmentVariable("RABBITMQ_DEFAULT_PASS") ?? "guest",
        Port = 5672,
        RequestedConnectionTimeout = TimeSpan.FromMilliseconds(3000)
    };

    /// <summary>
    ///     Creates and returns a new RabbitMQ connection using the configured ConnectionFactory.
    /// </summary>
    /// <returns>A new IConnection instance for interacting with RabbitMQ.</returns>
    public static IConnection CreateConnection() => ConnectionFactory.CreateConnection();

    /// <summary>
    ///     Creates a new channel from the given connection, and declares a test queue for message delivery.
    /// </summary>
    /// <param name="connection">The RabbitMQ connection to use for creating the channel and declaring the queue.</param>
    /// <returns>A new IModel instance representing the channel with the declared queue.</returns>
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
    ///     Starts a message consumer on the specified channel, processing messages using the provided callback.
    /// </summary>
    /// <param name="channel">The channel to start the consumer on.</param>
    /// <param name="processMessage">The callback to invoke for each received message.</param>
    public static void StartConsumer(IModel channel, Action<BasicDeliverEventArgs> processMessage)
    {
        var consumer = new EventingBasicConsumer(channel);

        consumer.Received += (bc, ea) => processMessage(ea);

        channel.BasicConsume(TestQueueName, true, consumer);
    }

    /// <summary>
    ///     Adds OpenTelemetry messaging tags to the provided activity, following the semantic conventions for messaging
    ///     systems.
    /// </summary>
    /// <param name="activity">The activity to add messaging tags to.</param>
    public static void AddMessagingTags(Activity activity)
    {
        // These tags are added demonstrating the semantic conventions of the OpenTelemetry messaging specification
        // See:
        //   * https://github.com/open-telemetry/semantic-conventions/blob/main/docs/messaging/messaging-spans.md#messaging-attributes
        //   * https://github.com/open-telemetry/semantic-conventions/blob/main/docs/messaging/rabbitmq.md
        activity.SetTag("messaging.system", "rabbitmq");
        activity.SetTag("messaging.destination_kind", "queue");
        activity.SetTag("messaging.destination", DefaultExchangeName);
        activity.SetTag("messaging.rabbitmq.routing_key", TestQueueName);
    }
}