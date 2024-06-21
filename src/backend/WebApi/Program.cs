using System.Diagnostics.CodeAnalysis;
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Utils.Messaging;
using WebApi;
using WebApi.Filters;

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

const string serviceName = "Test.WebApi";

builder.Services.AddSingleton<MessageSender>();

builder.Logging.AddOpenTelemetry(static options =>
{
    options.SetResourceBuilder(ResourceBuilder.CreateDefault()
                                              .AddService(serviceName))
           .AddConsoleExporter();
});

builder.Services.AddOpenTelemetry()
       .ConfigureResource(static resource => resource.AddService(serviceName))
       .WithTracing(static tracing => tracing
                                      .AddAspNetCoreInstrumentation()
                                      .AddHttpClientInstrumentation()
                                      .AddSource(nameof(MessageSender))
                                      //.AddConsoleExporter()
                                      .AddZipkinExporter(static options =>
                                      {
                                          var zipkinHostName = Environment.GetEnvironmentVariable("ZIPKIN_HOSTNAME") ?? "localhost";
                                          options.Endpoint = new Uri($"http://{zipkinHostName}:9411/api/v2/spans");
                                      }))
       .WithMetrics(static metrics => metrics
                                      .AddAspNetCoreInstrumentation()
                                      .AddHttpClientInstrumentation()
                                      //.AddConsoleExporter()
                                      .AddRuntimeInstrumentation());

builder.Services.AddControllers(static options => options.Filters.Add<ValidateModelAttribute>());
builder.Services.AddEndpointsApiExplorer();
var corsPolicyName = "corsPolicy";
builder.Services.AddCors(options => options
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
                           TermsOfService = new Uri("https://example.com/terms"),
                           Contact = new OpenApiContact
                           {
                               Name = "Example Contact",
                               Url = new Uri("https://example.com/contact")
                           },
                           License = new OpenApiLicense
                           {
                               Name = "Example License",
                               Url = new Uri("https://example.com/license")
                           }
                       });

    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
});

var app = builder.Build();

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
    app.UseSwaggerUI();
    app.UseReDoc();
}

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