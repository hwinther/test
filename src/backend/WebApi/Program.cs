using System.Diagnostics.CodeAnalysis;
using System.Reflection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
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
using WebApi.HealthChecks;
using WebApi.Hubs;
using WebApi.Messaging;
using WebApi.Middleware;
using WebApi.Options;
using WebApi.Repository;

var builder = WebApplication.CreateBuilder(args);

var configuration = builder.Configuration;

var oidcConfig = configuration.GetSection(OidcOptions.SectionName)
                              .Get<OidcOptions>() ?? new OidcOptions();

builder.Services.AddOptions<OidcOptions>()
       .Bind(configuration.GetSection(OidcOptions.SectionName));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
       .AddJwtBearer(options =>
       {
           options.Authority = oidcConfig.Authority;
           options.Audience = oidcConfig.Audience;
           options.TokenValidationParameters.ValidIssuer = oidcConfig.Authority;
           // Browsers cannot set Authorization headers on WebSocket upgrades, so SignalR's
           // JS client appends the token as ?access_token= on /hubs/* paths instead.
           options.Events = new JwtBearerEvents
           {
               OnMessageReceived = ctx =>
               {
                   var token = ctx.Request.Query["access_token"];
                   if (!string.IsNullOrEmpty(token) &&
                       ctx.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                       ctx.Token = token;

                   return Task.CompletedTask;
               }
           };
       });

builder.Services.AddAuthorization();
var healthChecks = builder.Services.AddHealthChecks();

var signalRBuilder = builder.Services
                            .AddSignalR()
                            .AddJsonProtocol(static opts =>
                                                 opts.PayloadSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase);

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
    healthChecks.AddDbContextCheck<BloggingContext>();
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

    var signalRRedisOptions = RedisUrlParser.Parse(redisConnectionString);
    signalRRedisOptions.AbortOnConnectFail = false;
    signalRRedisOptions.ChannelPrefix = RedisChannel.Literal("test-api.signalr");
    signalRBuilder.AddStackExchangeRedis(opts => opts.Configuration = signalRRedisOptions);
    healthChecks.AddCheck<RedisHealthCheck>("redis");
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
           tracing.AddAspNetCoreInstrumentation(static opts =>
                                                    opts.Filter = static ctx => !ctx.Request.Path.StartsWithSegments("/healthz"))
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
                                      .AddRuntimeInstrumentation()
                                      .AddMeter("Microsoft.Extensions.Diagnostics.HealthChecks"));

builder.Services.AddControllers(static options =>
{
    options.Filters.Add<ValidateModelAttribute>();
    options.OutputFormatters.RemoveType<StringOutputFormatter>();
    (options.OutputFormatters.First(static formatter => formatter is SystemTextJsonOutputFormatter) as SystemTextJsonOutputFormatter)?.SupportedMediaTypes.Remove("text/json");
});

builder.Services.TryAddEnumerable(ServiceDescriptor.Transient<IApplicationModelProvider, ProduceResponseTypeModelProvider>());

var corsOrigins = configuration.GetSection("Cors:AllowedOrigins")
                               .Get<string[]>() ?? ["https://localhost:5173"];

const string corsPolicyName = "corsPolicy";
builder.Services.AddCors(options => options
                             .AddPolicy(corsPolicyName,
                                        policyBuilder => policyBuilder
                                                         .WithOrigins(corsOrigins)
                                                         .AllowCredentials()
                                                         .AllowAnyHeader()
                                                         .AllowAnyMethod()));

builder.Services.AddSwaggerGen(options =>
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

    options.AddSecurityDefinition("oidc",
                                  new OpenApiSecurityScheme
                                  {
                                      Type = SecuritySchemeType.OAuth2,
                                      Flows = new OpenApiOAuthFlows
                                      {
                                          AuthorizationCode = new OpenApiOAuthFlow
                                          {
                                              AuthorizationUrl = new Uri($"{oidcConfig.Authority}/api/oidc/authorization"),
                                              TokenUrl = new Uri($"{oidcConfig.Authority}/api/oidc/token"),
                                              Scopes = new Dictionary<string, string>
                                              {
                                                  ["openid"] = "OpenID",
                                                  ["profile"] = "Profile",
                                                  ["email"] = "Email",
                                                  ["groups"] = "Groups",
                                                  ["offline_access"] = "Offline access"
                                              }
                                          }
                                      }
                                  });

    options.AddSecurityRequirement(static doc => new OpenApiSecurityRequirement
    {
        { new OpenApiSecuritySchemeReference("oidc", doc), [] }
    });
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
    app.UseSwaggerUI(options =>
    {
        options.DocExpansion(DocExpansion.None);
        options.OAuthClientId(oidcConfig.ClientId);
        options.OAuthUsePkce();
        options.OAuthScopes("openid", "profile", "email", "groups");
    });

    app.UseReDoc();
}

// app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors(corsPolicyName);
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat")
   .RequireAuthorization();

app.MapHealthChecks("/healthz");

app.Run();

/// <summary>
///     Test visibility class
/// </summary>
[ExcludeFromCodeCoverage]
public partial class Program
{
    // For test visibility
}