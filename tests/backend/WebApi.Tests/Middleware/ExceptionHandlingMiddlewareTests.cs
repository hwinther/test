using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using WebApi.Middleware;

namespace WebApi.Tests.Middleware;

public class ExceptionHandlingMiddlewareTests
{
    private readonly Mock<ILogger<ExceptionHandlingMiddleware>> _logger = new();

    private async Task<(HttpContext Context, JsonElement Body)> Run(RequestDelegate next)
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        await new ExceptionHandlingMiddleware(_logger.Object).InvokeAsync(context, next);

        context.Response.Body.Position = 0;
        var body = context.Response.Body.Length == 0
            ? default
            : await JsonSerializer.DeserializeAsync<JsonElement>(context.Response.Body,
                                                                 cancellationToken: TestContext.Current.CancellationToken);
        return (context, body);
    }

    [Fact]
    public async Task Passes_a_request_through_untouched()
    {
        var (context, _) = await Run(static ctx =>
        {
            ctx.Response.StatusCode = 204;
            return Task.CompletedTask;
        });

        Assert.Equal(204, context.Response.StatusCode);
        _logger.VerifyNoError();
    }

    [Theory]
    [InlineData(typeof(ApplicationException), 400, "Application exception occurred.")]
    [InlineData(typeof(KeyNotFoundException), 404, "The request key not found.")]
    [InlineData(typeof(UnauthorizedAccessException), 401, "Unauthorized.")]
    [InlineData(typeof(InvalidOperationException), 500, "Internal server error. Please retry later.")]
    public async Task Maps_an_exception_to_problem_details(Type exceptionType, int status, string detail)
    {
        var (context, body) = await Run(_ => throw (Exception) Activator.CreateInstance(exceptionType)!);

        Assert.Equal(status, context.Response.StatusCode);
        Assert.StartsWith("application/json", context.Response.ContentType);
        Assert.Equal(status, body.GetProperty("status").GetInt32());
        Assert.Equal(detail, body.GetProperty("detail").GetString());
        _logger.VerifyLog(LogLevel.Error, Times.Once(), "An unexpected error occurred.");
    }
}
