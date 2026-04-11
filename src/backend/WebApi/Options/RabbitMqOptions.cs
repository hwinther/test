namespace WebApi.Options;

/// <summary>
///     RabbitMQ client settings (binds configuration section <c>RabbitMq</c>).
/// </summary>
public sealed class RabbitMqOptions
{
    /// <summary>Name of the configuration section.</summary>
    public const string SectionName = "RabbitMq";

    /// <summary>Broker host name.</summary>
    public string HostName { get; set; } = "localhost";

    /// <summary>Broker AMQP port.</summary>
    public int Port { get; set; } = 5672;

    /// <summary>Login user name.</summary>
    public string UserName { get; set; } = "guest";

    /// <summary>Login password.</summary>
    public string Password { get; set; } = "guest";
}
