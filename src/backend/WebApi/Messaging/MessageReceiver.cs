// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

using System.Diagnostics;
using System.Text;
using OpenTelemetry;
using OpenTelemetry.Context.Propagation;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace WebApi.Messaging;

/// <summary>
///     Represents a message receiver that listens for messages from a RabbitMQ queue and processes them.
///     This class is responsible for establishing a connection to RabbitMQ, declaring a queue, and starting a consumer
///     that listens for messages on that queue. It uses OpenTelemetry to propagate trace context for distributed tracing.
/// </summary>
public sealed class MessageReceiver : IDisposable
{
    private static readonly ActivitySource ActivitySource = new(nameof(MessageReceiver));
    private static readonly TextMapPropagator Propagator = Propagators.DefaultTextMapPropagator;

    private readonly ILogger<MessageReceiver> _logger;
    private readonly IConnection _connection;
    private readonly IModel _channel;

    /// <summary>
    ///     Initializes a new instance of the <see cref="MessageReceiver" /> class, creating a connection to RabbitMQ
    ///     and declaring a queue for message consumption.
    /// </summary>
    /// <param name="logger">The logger used for logging information and errors.</param>
    public MessageReceiver(ILogger<MessageReceiver> logger)
    {
        _logger = logger;
        _connection = RabbitMqHelper.CreateConnection();
        _channel = RabbitMqHelper.CreateModelAndDeclareTestQueue(_connection);
    }

    /// <summary>
    ///     Releases all resources used by the <see cref="MessageReceiver" />.
    /// </summary>
    public void Dispose()
    {
        _channel.Dispose();
        _connection.Dispose();
    }

    /// <summary>
    ///     Starts the message consumer which listens for messages on the declared queue and processes them.
    /// </summary>
    public void StartConsumer()
    {
        RabbitMqHelper.StartConsumer(_channel, ReceiveMessage);
    }

    /// <summary>
    ///     Processes received messages from the RabbitMQ queue. It extracts and propagates the trace context for
    ///     distributed tracing and logs the message content. It also simulates message processing by sleeping for a short
    ///     duration.
    /// </summary>
    /// <param name="ea">The event arguments containing the message and metadata.</param>
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

            _logger.LogInformation($"Message received: [{message}]");

            activity?.SetTag("message", message);

            // The OpenTelemetry messaging specification defines a number of attributes. These attributes are added here.
            if (activity != null)
                RabbitMqHelper.AddMessagingTags(activity);

            // Simulate some work
            Thread.Sleep(1000);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Message processing failed.");
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
            _logger.LogError(ex, "Failed to extract trace context.");
        }

        return [];
    }
}