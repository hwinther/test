using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using WebApi.Options;

namespace WebApi.Messaging;

/// <inheritdoc />
public sealed class RabbitMqConnectionFactory(IOptions<RabbitMqOptions> options) : IRabbitMqConnectionFactory
{
    /// <inheritdoc />
    public Task<IConnection> CreateConnectionAsync()
    {
        var o = options.Value;
        var factory = new ConnectionFactory
        {
            HostName = o.HostName,
            Port = o.Port,
            UserName = o.UserName,
            Password = o.Password,
            RequestedConnectionTimeout = TimeSpan.FromMilliseconds(3000),
        };

        return factory.CreateConnectionAsync();
    }
}
