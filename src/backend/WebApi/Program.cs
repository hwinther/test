using System.Reflection;
using Microsoft.OpenApi.Models;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

const string serviceName = "Test.WebApi";
builder.Logging.AddOpenTelemetry(static options =>
{
    options
        .SetResourceBuilder(
            ResourceBuilder.CreateDefault()
                           .AddService(serviceName))
        .AddConsoleExporter();
});

builder.Services.AddOpenTelemetry()
       .ConfigureResource(static resource => resource.AddService(serviceName))
       .WithTracing(static tracing => tracing
                                      .AddAspNetCoreInstrumentation()
                                      .AddConsoleExporter())
       .WithMetrics(static metrics => metrics
                                      .AddAspNetCoreInstrumentation()
                                      .AddConsoleExporter());

builder.Services.AddControllers();
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
public partial class Program
{
    // For test visibility
}