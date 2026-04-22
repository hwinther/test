using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Exceptions;
using WebApi.Options;

namespace WebApi.Messaging;

/// <inheritdoc />
public sealed class RabbitMqConnectionFactory(
    IOptions<RabbitMqOptions> options,
    ILogger<RabbitMqConnectionFactory> logger) : IRabbitMqConnectionFactory
{
    /// <inheritdoc />
    public async Task<IConnection> CreateConnectionAsync()
    {
        var o = options.Value;
        var hostName = NormalizeHost(o.HostName);
        var userName = NormalizeUser(o.UserName);
        var password = NormalizePassword(o.Password);
        var virtualHost = NormalizeVirtualHost(o.VirtualHost);

        var factory = new ConnectionFactory
        {
            HostName = hostName,
            Port = o.Port,
            UserName = userName,
            Password = password,
            VirtualHost = virtualHost,
            RequestedConnectionTimeout = TimeSpan.FromMilliseconds(3000)
        };

        try
        {
            return await factory.CreateConnectionAsync().ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            LogFailure(hostName, o.Port, virtualHost, userName, ex);
            throw;
        }
    }

    private void LogFailure(string hostName, int port, string virtualHost, string userName, Exception ex)
    {
        logger.LogWarning(
            ex,
            "RabbitMQ connection failed (host {HostName}, port {Port}, virtual host {VirtualHost}, user {UserName}).",
            hostName,
            port,
            virtualHost,
            userName);

        if (hostName.Contains(".svc.", StringComparison.Ordinal))
        {
            logger.LogWarning(
                "The host name looks like in-cluster Kubernetes DNS. From a local machine it usually will not resolve; use kubectl port-forward to localhost and point RabbitMq:HostName at 127.0.0.1 (or run the API inside the cluster).");
        }

        if (ContainsAuthenticationFailure(ex))
        {
            logger.LogWarning(
                "Authentication was refused. Confirm the user exists on this broker, has access to virtual host {VirtualHost}, and that username/password have no accidental trailing characters from secrets (newlines are common in copied or mounted secrets).",
                virtualHost);
        }
    }

    private static bool ContainsAuthenticationFailure(Exception? ex)
    {
        for (var e = ex; e != null; e = e.InnerException)
        {
            if (e is AuthenticationFailureException)
                return true;
        }

        return false;
    }

    private static string NormalizeHost(string? value) => string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim();

    private static string NormalizeUser(string? value) => string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim();

    private static string NormalizePassword(string? value) =>
        value == null ? string.Empty : value.TrimEnd('\r', '\n', ' ', '\t');

    private static string NormalizeVirtualHost(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return "/";

        var t = value.Trim();
        return t.Length == 0 ? "/" : t;
    }
}
