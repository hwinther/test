using System.Diagnostics.CodeAnalysis;
using System.Reflection;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.OpenApi;
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