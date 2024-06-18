// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

using System.Diagnostics;
using System.Text;
using OpenTelemetry;
using OpenTelemetry.Context.Propagation;
using RabbitMQ.Client;

namespace Utils.Messaging;

/// <summary>
///     TODO
/// </summary>
public class MessageSender : IDisposable
{
    private static readonly ActivitySource ActivitySource = new(nameof(MessageSender));
    private static readonly TextMapPropagator Propagator = Propagators.DefaultTextMapPropagator;

    private readonly ILogger<MessageSender> logger;
    private readonly IConnection connection;
    private readonly IModel channel;

    /// <summary>
    ///     TODO
    /// </summary>
    public MessageSender(ILogger<MessageSender> logger)
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
    public string SendMessage()
    {
        try
        {
            // Start an activity with a name following the semantic convention of the OpenTelemetry messaging specification.
            // https://github.com/open-telemetry/semantic-conventions/blob/main/docs/messaging/messaging-spans.md#span-name
            var activityName = $"{RabbitMqHelper.TestQueueName} send";

            using var activity = ActivitySource.StartActivity(activityName, ActivityKind.Producer);
            var props = channel.CreateBasicProperties();

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

            channel.BasicPublish(
                RabbitMqHelper.DefaultExchangeName,
                RabbitMqHelper.TestQueueName,
                props,
                Encoding.UTF8.GetBytes(body));

            logger.LogInformation($"Message sent: [{body}]");

            return body;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Message publishing failed.");
            throw;
        }
    }

    private void InjectTraceContextIntoBasicProperties(IBasicProperties props, string key, string value)
    {
        try
        {
            if (props.Headers == null)
                props.Headers = new Dictionary<string, object>();

            props.Headers[key] = value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to inject trace context.");
        }
    }
}