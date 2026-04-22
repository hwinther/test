using System.Diagnostics.CodeAnalysis;
using System.Reflection;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.OpenApi;
using Npgsql;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using StackExchange.Redis;
using Swashbuckle.AspNetCore.SwaggerUI;
using WebApi.Database;
using WebApi.Filters;
using WebApi.Messaging;
using WebApi.Middleware;
using WebApi.Options;
using WebApi.Repository;

var builder = WebApplication.CreateBuilder(args);

var configuration = builder.Configuration;

// OpenAPI generation (`dotnet swagger tofile` uses ASPNETCORE_ENVIRONMENT=Swagger) does not need SQL Server.
var registerDataAccess = !builder.Environment.IsEnvironment("Swagger");
if (registerDataAccess)
{
    var bloggingConnectionString = configuration.GetConnectionString("Blogging");
    if (string.IsNullOrWhiteSpace(bloggingConnectionString))
        throw new InvalidOperationException(
            "Database connection string is required. Set ConnectionStrings:Blogging (for example in appsettings or user secrets, or the ConnectionStrings__Blogging environment variable).");

    builder.Services.AddDbContext<BloggingContext>(options =>
                                                       options.UseNpgsql(bloggingConnectionString,
                                                                         static sqlOptions =>
                                                                         {
                                                                             sqlOptions.CommandTimeout(30);
                                                                             sqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                                                                         })
                                                              .EnableDetailedErrors(builder.Environment.IsDevelopment())
                                                              .EnableSensitiveDataLogging(builder.Environment.IsDevelopment()));

    builder.Services.AddScoped<IBloggingRepository, BloggingRepository>();
}

const string serviceName = "Test.WebApi";

builder.Services.AddOptions<RabbitMqOptions>()
       .Bind(configuration.GetSection(RabbitMqOptions.SectionName))
       .Validate(static o => !string.IsNullOrWhiteSpace(o.HostName), "RabbitMq:HostName is required.")
       .Validate(static o => o.Port is > 0 and <= 65535, "RabbitMq:Port must be between 1 and 65535.")
       .Validate(static o => !string.IsNullOrWhiteSpace(o.UserName), "RabbitMq:UserName is required.")
       .Validate(static o => !string.IsNullOrWhiteSpace(o.Password), "RabbitMq:Password is required.")
       .ValidateOnStart();

builder.Services.AddSingleton<IRabbitMqConnectionFactory, RabbitMqConnectionFactory>();
builder.Services.AddSingleton<IMessageSender, MessageSender>();

var redisConnectionString = configuration.GetConnectionString("Redis");
if (!string.IsNullOrWhiteSpace(redisConnectionString))
{
    var redisOptions = RedisUrlParser.Parse(redisConnectionString);
    redisOptions.AbortOnConnectFail = false;
    builder.Services.AddSingleton<IConnectionMultiplexer>(_ => ConnectionMultiplexer.Connect(redisOptions));
}

// In Development, skip OTLP unless explicitly configured (avoids export errors when no collector on :4317).
var exportToOtlp = !builder.Environment.IsDevelopment()
                   || OpenTelemetryEndpointResolver.HasExplicitOtlpConfiguration(configuration);

if (exportToOtlp)
    builder.Logging.AddOpenTelemetry(options =>
    {
        options.SetResourceBuilder(ResourceBuilder.CreateDefault()
                                                  .AddService(serviceName))
               .AddOtlpExporter(otlp => { otlp.Endpoint = new Uri(OpenTelemetryEndpointResolver.GetLogsEndpoint(configuration)); });
    });

builder.Services.AddOpenTelemetry()
       .ConfigureResource(static resource => resource.AddService(serviceName))
       .WithTracing(tracing =>
       {
           tracing.AddAspNetCoreInstrumentation()
                  .AddHttpClientInstrumentation()
                  .AddEntityFrameworkCoreInstrumentation()
                  .AddRabbitMQInstrumentation()
                  .AddNpgsql()
                  .AddSource(nameof(MessageSender))
                  .AddSource(nameof(MessageReceiver));

           if (exportToOtlp)
               tracing.AddOtlpExporter(otlp => { otlp.Endpoint = new Uri(OpenTelemetryEndpointResolver.GetTraceEndpoint(configuration)); });
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
                           Description = "An ASP.NET Core Web API example instance"
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