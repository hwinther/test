using System.Diagnostics.CodeAnalysis;
using System.Reflection;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.OpenApi;
using OpenTelemetry.Exporter;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Swashbuckle.AspNetCore.SwaggerUI;
using WebApi.Database;
using WebApi.Filters;
using WebApi.Messaging;
using WebApi.Middleware;
using WebApi.Repository;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<BloggingContext>(options =>
                                                   options.UseSqlServer(Environment.GetEnvironmentVariable("DB_CONNECTION"),
                                                                        static sqlOptions =>
                                                                        {
                                                                            sqlOptions.CommandTimeout(30);
                                                                            sqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                                                                        })
                                                          .EnableDetailedErrors(builder.Environment.IsDevelopment())
                                                          .EnableSensitiveDataLogging(builder.Environment.IsDevelopment()));

builder.Services.AddScoped<IBloggingRepository, BloggingRepository>();

const string serviceName = "Test.WebApi";

builder.Services.AddSingleton<IMessageSender, MessageSender>();

// In Development, skip OTLP unless explicitly configured (avoids export errors when no collector on :4317).
var exportToOtlp = !builder.Environment.IsDevelopment()
                   || !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("OTEL_EXPORTER_OTLP_ENDPOINT"))
                   || !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("OTEL_EXPORTER_OTLP_LOGS_ENDPOINT"));

static void ConfigureOtlpExporter(OtlpExporterOptions options)
{
    var otlpEndpoint = Environment.GetEnvironmentVariable("OTEL_EXPORTER_OTLP_ENDPOINT")
                                  ?.Trim()
                       ?? "http://localhost:4317";

    options.Endpoint = new Uri(otlpEndpoint);
}

static void ConfigureOtlpLogExporter(OtlpExporterOptions options)
{
    var endpoint = Environment.GetEnvironmentVariable("OTEL_EXPORTER_OTLP_LOGS_ENDPOINT")
                              ?.Trim()
                   ?? Environment.GetEnvironmentVariable("OTEL_EXPORTER_OTLP_ENDPOINT")
                                 ?.Trim()
                   ?? "http://localhost:4317";

    options.Endpoint = new Uri(endpoint);
}

if (exportToOtlp)
{
    builder.Logging.AddOpenTelemetry(static options =>
    {
        options.SetResourceBuilder(ResourceBuilder.CreateDefault()
                                                  .AddService(serviceName))
               .AddOtlpExporter(ConfigureOtlpLogExporter);
    });
}

builder.Services.AddOpenTelemetry()
       .ConfigureResource(static resource => resource.AddService(serviceName))
       .WithTracing(tracing =>
       {
           tracing.AddAspNetCoreInstrumentation()
                  .AddHttpClientInstrumentation()
                  .AddEntityFrameworkCoreInstrumentation()
                  .AddRabbitMQInstrumentation()
                  .AddSource(nameof(MessageSender))
                  .AddSource(nameof(MessageReceiver));

           if (exportToOtlp)
           {
               tracing.AddOtlpExporter(ConfigureOtlpExporter);
           }
       })
       .WithMetrics(static metrics => metrics
                                      .AddAspNetCoreInstrumentation()
                                      .AddHttpClientInstrumentation()
                                      .AddRuntimeInstrumentation());

builder.Services.AddControllers(static options =>
{
    options.Filters.Add<ValidateModelAttribute>();
    options.OutputFormatters.RemoveType<StringOutputFormatter>();
    (options.OutputFormatters.First(static formatter => formatter is SystemTextJsonOutputFormatter) as SystemTextJsonOutputFormatter)?.SupportedMediaTypes.Remove("text/json");
});

builder.Services.TryAddEnumerable(ServiceDescriptor.Transient<IApplicationModelProvider, ProduceResponseTypeModelProvider>());

const string corsPolicyName = "corsPolicy";
builder.Services.AddCors(static options => options
                             .AddPolicy(corsPolicyName,
                                        static policyBuilder => policyBuilder
                                                                .WithOrigins("https://localhost:5173")
                                                                .AllowCredentials()
                                                                .AllowAnyHeader()
                                                                .AllowAnyMethod()));

builder.Services.AddSwaggerGen(static options =>
{
    options.SwaggerDoc("v1",
                       new OpenApiInfo
                       {
                           Version = "v1",
                           Title = "Example API",
                           Description = "An ASP.NET Core Web API example instance",
                       });

    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));

    options.SwaggerGeneratorOptions.XmlCommentEndOfLine = "\n";
});

builder.Services.AddProblemDetails();

var app = builder.Build();

if (!app.Environment.IsEnvironment("Swagger") && !EF.IsDesignTime)
    try
    {
        using var serviceScope = app.Services.CreateScope();
        var bloggingContext = serviceScope.ServiceProvider.GetRequiredService<BloggingContext>();
        bloggingContext.Database.Migrate();
    }
    catch (Exception exception)
    {
        Console.WriteLine($"Migration exception: {exception.Message}");
    }

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(static options => options.DocExpansion(DocExpansion.None));
    app.UseReDoc();
}

// app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors(corsPolicyName);
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();

/// <summary>
///     Test visibility class
/// </summary>
[ExcludeFromCodeCoverage]
public partial class Program
{
    // For test visibility
}