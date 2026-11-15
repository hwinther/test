using Microsoft.Extensions.Configuration;
using WebApi.Options;

namespace WebApi.Tests.Options;

public class OpenTelemetryEndpointResolverTests
{
    private static IConfiguration Config(params (string Key, string? Value)[] values) =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(values.Select(static v => new KeyValuePair<string, string?>(v.Key, v.Value)))
            .Build();

    [Fact]
    public void Defaults_to_the_local_collector()
    {
        var config = Config();

        Assert.Equal("http://localhost:4317", OpenTelemetryEndpointResolver.GetTraceEndpoint(config));
        Assert.Equal("http://localhost:4317", OpenTelemetryEndpointResolver.GetLogsEndpoint(config));
        Assert.False(OpenTelemetryEndpointResolver.HasExplicitOtlpConfiguration(config));
    }

    [Fact]
    public void The_otel_environment_variables_win_over_the_app_settings()
    {
        var config = Config(("OTEL_EXPORTER_OTLP_ENDPOINT", " http://collector:4317 "),
                            ("OTEL_EXPORTER_OTLP_LOGS_ENDPOINT", "http://logs:4317"),
                            ("OpenTelemetry:OtlpEndpoint", "http://ignored:4317"),
                            ("OpenTelemetry:OtlpLogsEndpoint", "http://ignored:4317"));

        Assert.Equal("http://collector:4317", OpenTelemetryEndpointResolver.GetTraceEndpoint(config));
        Assert.Equal("http://logs:4317", OpenTelemetryEndpointResolver.GetLogsEndpoint(config));
        Assert.True(OpenTelemetryEndpointResolver.HasExplicitOtlpConfiguration(config));
    }

    [Fact]
    public void The_app_settings_apply_without_the_variables()
    {
        var config = Config(("OpenTelemetry:OtlpEndpoint", "http://traces:4317"),
                            ("OpenTelemetry:OtlpLogsEndpoint", "http://logs:4317"));

        Assert.Equal("http://traces:4317", OpenTelemetryEndpointResolver.GetTraceEndpoint(config));
        Assert.Equal("http://logs:4317", OpenTelemetryEndpointResolver.GetLogsEndpoint(config));
    }

    [Fact]
    public void Logs_fall_back_to_the_trace_endpoint()
    {
        var config = Config(("OpenTelemetry:OtlpEndpoint", "http://traces:4317"));
        Assert.Equal("http://traces:4317", OpenTelemetryEndpointResolver.GetLogsEndpoint(config));
    }

    [Theory]
    [InlineData("OTEL_EXPORTER_OTLP_ENDPOINT")]
    [InlineData("OTEL_EXPORTER_OTLP_LOGS_ENDPOINT")]
    [InlineData("OpenTelemetry:OtlpEndpoint")]
    [InlineData("OpenTelemetry:OtlpLogsEndpoint")]
    public void Any_one_setting_is_explicit_configuration(string key)
    {
        Assert.True(OpenTelemetryEndpointResolver.HasExplicitOtlpConfiguration(Config((key, "http://x:4317"))));
        Assert.False(OpenTelemetryEndpointResolver.HasExplicitOtlpConfiguration(Config((key, "  "))));
    }
}
