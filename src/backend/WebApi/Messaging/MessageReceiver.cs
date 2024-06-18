// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

using System.Diagnostics;
using System.Text;
using OpenTelemetry;
using OpenTelemetry.Context.Propagation;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Utils.Messaging;

/// <summary>
///     TODO
/// </summary>
public class MessageReceiver : IDisposable
{
    private static readonly ActivitySource ActivitySource = new(nameof(MessageReceiver));
    private static readonly TextMapPropagator Propagator = Propagators.DefaultTextMapPropagator;

    private readonly ILogger<MessageReceiver> logger;
    private readonly IConnection connection;
    private readonly IModel channel;

    /// <summary>
    ///     TODO
    /// </summary>
    public MessageReceiver(ILogger<MessageReceiver> logger)
    {
        this.logger = logger;
        connection = RabbitMqHelper.CreateConnection();
        channel = RabbitMqHelper.CreateModelAndDeclareTestQueue(connection);
    }

    /// <summary>
    ///     TODO
    /// </summary>
    public void Dispose()
    {
        channel.Dispose();
        connection.Dispose();
    }

    /// <summary>
    ///     TODO
    /// </summary>
    public void StartConsumer()
    {
        RabbitMqHelper.StartConsumer(channel, ReceiveMessage);
    }

    /// <summary>
    ///     TODO
    /// </summary>
    public void ReceiveMessage(BasicDeliverEventArgs ea)
    {
        // Extract the PropagationContext of the upstream parent from the message headers.
        var parentContext = Propagator.Extract(default, ea.BasicProperties, ExtractTraceContextFromBasicProperties);
        Baggage.Current = parentContext.Baggage;

        // Start an activity with a name following the semantic convention of the OpenTelemetry messaging specification.
        // https://github.com/open-telemetry/semantic-conventions/blob/main/docs/messaging/messaging-spans.md#span-name
        var activityName = $"{ea.RoutingKey} receive";

        using var activity = ActivitySource.StartActivity(activityName, ActivityKind.Consumer, parentContext.ActivityContext);
        try
        {
            var message = Encoding.UTF8.GetString(ea.Body.Span.ToArray());

            logger.LogInformation($"Message received: [{message}]");

            activity?.SetTag("message", message);

            // The OpenTelemetry messaging specification defines a number of attributes. These attributes are added here.
            if (activity != null)
                RabbitMqHelper.AddMessagingTags(activity);

            // Simulate some work
            Thread.Sleep(1000);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Message processing failed.");
        }
    }

    private IEnumerable<string> ExtractTraceContextFromBasicProperties(IBasicProperties props, string key)
    {
        try
        {
            if (props.Headers.TryGetValue(key, out var value) && value is byte[] bytes)
                return
                [
                    Encoding.UTF8.GetString(bytes)
                ];
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to extract trace context.");
        }

        return [];
    }
}