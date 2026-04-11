using Microsoft.Extensions.Configuration;

namespace WebApi.Options;

/// <summary>
///     Resolves OTLP endpoints from configuration and standard OTEL environment variables (Kubernetes / collectors).
/// </summary>
public static class OpenTelemetryEndpointResolver
{
    private const string DefaultOtlpUri = "http://localhost:4317";

    /// <summary>Trace / default OTLP gRPC endpoint.</summary>
    public static string GetTraceEndpoint(IConfiguration configuration) =>
        configuration["OTEL_EXPORTER_OTLP_ENDPOINT"]?.Trim()
        ?? configuration["OpenTelemetry:OtlpEndpoint"]?.Trim()
        ?? DefaultOtlpUri;

    /// <summary>Logs OTLP endpoint; falls back to trace endpoint then default.</summary>
    public static string GetLogsEndpoint(IConfiguration configuration) =>
        configuration["OTEL_EXPORTER_OTLP_LOGS_ENDPOINT"]?.Trim()
        ?? configuration["OpenTelemetry:OtlpLogsEndpoint"]?.Trim()
        ?? GetTraceEndpoint(configuration);

    /// <summary>Whether any OTLP endpoint is configured (beyond implicit default when not in Development).</summary>
    public static bool HasExplicitOtlpConfiguration(IConfiguration configuration) =>
        !string.IsNullOrWhiteSpace(configuration["OTEL_EXPORTER_OTLP_ENDPOINT"])
        || !string.IsNullOrWhiteSpace(configuration["OTEL_EXPORTER_OTLP_LOGS_ENDPOINT"])
        || !string.IsNullOrWhiteSpace(configuration["OpenTelemetry:OtlpEndpoint"])
        || !string.IsNullOrWhiteSpace(configuration["OpenTelemetry:OtlpLogsEndpoint"]);
}
