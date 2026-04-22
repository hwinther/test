namespace WebApi.Entities;

/// <summary>
///     Represents the status of all service connections.
/// </summary>
public class ServiceStatus
{
    /// <summary>
    ///     The status of the PostgreSQL connection.
    /// </summary>
    public required ConnectionStatus Postgres { get; set; }

    /// <summary>
    ///     The status of the RabbitMQ connection.
    /// </summary>
    public required ConnectionStatus RabbitMq { get; set; }

    /// <summary>
    ///     The status of the Redis connection.
    /// </summary>
    public required ConnectionStatus Redis { get; set; }
}

/// <summary>
///     Represents the status of a single service connection.
/// </summary>
public class ConnectionStatus
{
    /// <summary>
    ///     Whether the connection is available.
    /// </summary>
    /// <example>true</example>
    public required bool Connected { get; set; }

    /// <summary>
    ///     Error message if the connection failed, otherwise null.
    /// </summary>
    /// <example>Connection refused</example>
    public string? Error { get; set; }
}
