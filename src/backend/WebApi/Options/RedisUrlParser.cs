using StackExchange.Redis;

namespace WebApi.Options;

/// <summary>
///     Converts a Redis URL (<c>redis://[:password@]host[:port][/db]</c>) to
///     <see cref="ConfigurationOptions" />. Falls back to native StackExchange.Redis
///     connection-string format when the value is not a URL.
/// </summary>
public static class RedisUrlParser
{
    /// <summary>
    ///     Parses <paramref name="value" /> into a <see cref="ConfigurationOptions" /> instance.
    /// </summary>
    public static ConfigurationOptions Parse(string value)
    {
        if (!value.StartsWith("redis://", StringComparison.OrdinalIgnoreCase) &&
            !value.StartsWith("rediss://", StringComparison.OrdinalIgnoreCase))
            return ConfigurationOptions.Parse(value);

        var uri = new Uri(value);
        var options = new ConfigurationOptions();

        options.EndPoints.Add(uri.Host, uri.IsDefaultPort ? 6379 : uri.Port);

        if (!string.IsNullOrEmpty(uri.UserInfo))
        {
            var colon = uri.UserInfo.IndexOf(':');
            var password = colon >= 0
                ? Uri.UnescapeDataString(uri.UserInfo[(colon + 1)..])
                : Uri.UnescapeDataString(uri.UserInfo);

            if (!string.IsNullOrEmpty(password))
                options.Password = password;
        }

        var path = uri.AbsolutePath.TrimStart('/');
        if (int.TryParse(path, out var db))
            options.DefaultDatabase = db;

        if (uri.Scheme.Equals("rediss", StringComparison.OrdinalIgnoreCase))
            options.Ssl = true;

        return options;
    }
}
