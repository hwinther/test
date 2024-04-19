using System.Reflection;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
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

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();