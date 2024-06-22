using System.Net;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Middleware;

/// <summary>
///     Middleware for handling exceptions globally across the application. It catches exceptions thrown from downstream
///     middleware,
///     logs them, and returns appropriate problem details responses.
/// </summary>
/// <param name="logger">The logger used for logging exceptions.</param>
public class ExceptionHandlingMiddleware(ILogger<ExceptionHandlingMiddleware> logger) : IMiddleware
{
    /// <summary>
    ///     Processes a request. If an exception occurs, it is caught and handled by generating a problem details response.
    /// </summary>
    /// <param name="context">The <see cref="HttpContext" /> for the current request.</param>
    /// <param name="next">The next middleware in the pipeline.</param>
    /// <returns>A <see cref="Task" /> that represents the completion of request processing.</returns>
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private static ProblemDetails ProblemDetailsFactory(HttpStatusCode statusCode, string detail) =>
        new()
        {
            Status = (int) statusCode,
            Detail = detail
            // TODO: add type from ietf docs
        };

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        logger.LogError(exception, "An unexpected error occurred.");

        var problemDetails = exception switch
        {
            ApplicationException _ => ProblemDetailsFactory(HttpStatusCode.BadRequest, "Application exception occurred."),
            KeyNotFoundException _ => ProblemDetailsFactory(HttpStatusCode.NotFound, "The request key not found."),
            UnauthorizedAccessException _ => ProblemDetailsFactory(HttpStatusCode.Unauthorized, "Unauthorized."),
            _ => ProblemDetailsFactory(HttpStatusCode.InternalServerError, "Internal server error. Please retry later.")
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = problemDetails.Status ?? 500;
        await context.Response.WriteAsJsonAsync(problemDetails);
    }
}