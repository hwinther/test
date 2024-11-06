// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

using System.Diagnostics;
using System.Text;
using OpenTelemetry;
using OpenTelemetry.Context.Propagation;
using RabbitMQ.Client;

namespace WebApi.Messaging;

/// <summary>
///     Provides functionality to send messages to a RabbitMQ queue, including support for propagating OpenTelemetry trace
///     context.
///     Implements IDisposable to ensure that resources are released properly when the object is no longer needed.
/// </summary>
public sealed class MessageSender : IMessageSender, IDisposable
{
    private static readonly ActivitySource ActivitySource = new(nameof(MessageSender));
    private static readonly TextMapPropagator Propagator = Propagators.DefaultTextMapPropagator;

    private readonly ILogger<MessageSender> _logger;
    private readonly IConnection _connection;
    private readonly IChannel _channel;

    /// <summary>
    ///     Initializes a new instance of the <see cref="MessageSender" /> class, establishing a connection and channel to
    ///     RabbitMQ.
    /// </summary>
    /// <param name="logger">The logger used for logging information and errors.</param>
    public MessageSender(ILogger<MessageSender> logger)
    {
        _logger = logger;
        _connection = RabbitMqHelper.CreateConnectionAsync()
                                    .GetAwaiter()
                                    .GetResult();

        _channel = RabbitMqHelper.CreateModelAndDeclareTestQueueAsync(_connection)
                                 .GetAwaiter()
                                 .GetResult();
    }

    /// <summary>
    ///     Releases all resources used by the <see cref="MessageSender" />.
    /// </summary>
    public void Dispose()
    {
        _channel.Dispose();
        _connection.Dispose();
    }

    /// <inheritdoc />
    /// <remarks>Including propagating the OpenTelemetry trace context.</remarks>
    public async Task<string> SendMessageAsync()
    {
        try
        {
            // Start an activity with a name following the semantic convention of the OpenTelemetry messaging specification.
            // https://github.com/open-telemetry/semantic-conventions/blob/main/docs/messaging/messaging-spans.md#span-name
            var activityName = $"{RabbitMqHelper.TestQueueName} send";

            using var activity = ActivitySource.StartActivity(activityName, ActivityKind.Producer);
            var props = new BasicProperties();

            // Depending on Sampling (and whether a listener is registered or not), the
            // activity above may not be created.
            // If it is created, then propagate its context.
            // If it is not created, the propagate the Current context,
            // if any.
            ActivityContext contextToInject = default;
            if (activity != null)
                contextToInject = activity.Context;
            else if (Activity.Current != null)
                contextToInject = Activity.Current.Context;

            // Inject the ActivityContext into the message headers to propagate trace context to the receiving service.
            Propagator.Inject(new PropagationContext(contextToInject, Baggage.Current), props, InjectTraceContextIntoBasicProperties);

            // The OpenTelemetry messaging specification defines a number of attributes. These attributes are added here.
            if (activity != null)
                RabbitMqHelper.AddMessagingTags(activity);

            var body = $"Published message: DateTime.Now = {DateTime.Now}.";

            await _channel.BasicPublishAsync(
                RabbitMqHelper.DefaultExchangeName,
                RabbitMqHelper.TestQueueName,
                true,
                props,
                Encoding.UTF8.GetBytes(body));

            _logger.LogInformation("Message sent: [{Body}]", body);

            return body;
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Message publishing failed.");
            throw;
        }
    }

    /// <summary>
    ///     Injects the trace context into the basic properties of a RabbitMQ message.
    /// </summary>
    /// <param name="props">The basic properties of the message where the context is to be injected.</param>
    /// <param name="key">The key for the trace context to be injected.</param>
    /// <param name="value">The value of the trace context to be injected.</param>
    private void InjectTraceContextIntoBasicProperties(IBasicProperties props, string key, string value)
    {
        try
        {
            props.Headers ??= new Dictionary<string, object?>();

            props.Headers[key] = value;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to inject trace context.");
        }
    }
}

/// <summary>
///     Defines functionality to send messages to a RabbitMQ queue
///     See also: <seealso cref="MessageSender">MessageSender</seealso>
/// </summary>
public interface IMessageSender
{
    /// <summary>
    ///     Sends a message to a RabbitMQ queue
    /// </summary>
    /// <returns>A string representing the message that was sent.</returns>
    public Task<string> SendMessageAsync();
}