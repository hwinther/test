using RabbitMQ.Client;

namespace WebApi.Messaging;

/// <summary>
///     Creates RabbitMQ connections from configured <see cref="Options.RabbitMqOptions" />.
/// </summary>
public interface IRabbitMqConnectionFactory
{
    /// <summary>
    ///     Opens a new connection to the broker.
    /// </summary>
    /// <returns>An open <see cref="IConnection" />.</returns>
    Task<IConnection> CreateConnectionAsync();
}
