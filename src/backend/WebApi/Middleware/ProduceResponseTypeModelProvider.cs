using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;

namespace WebApi.Middleware;

/// <summary>
///     Provides a model provider that automatically adds response type metadata to controller actions.
///     This class implements the <see cref="IApplicationModelProvider" /> interface to modify the application model
///     during startup. It assumes all controller actions return a <see cref="Task{ActionResult}" />, and it adds
///     <see cref="ProducesResponseTypeAttribute" /> instances for HTTP 200, 500, and 510 status codes based on the
///     action's return type.
/// </summary>
public class ProduceResponseTypeModelProvider : IApplicationModelProvider
{
    /// <inheritdoc />
    public int Order => 3;

    /// <inheritdoc />
    public void OnProvidersExecuted(ApplicationModelProviderContext context)
    {
        // Not needed
    }

    /// <inheritdoc />
    public void OnProvidersExecuting(ApplicationModelProviderContext context)
    {
        foreach (var controller in context.Result.Controllers)
        {
            foreach (var action in controller.Actions)
            {
                var returnType = action.ActionMethod.ReturnType.GenericTypeArguments.FirstOrDefault()
                                       ?.GetGenericArguments()
                                       .FirstOrDefault();

                action.Filters.Add(new ProducesResponseTypeAttribute(StatusCodes.Status510NotExtended));

                if (returnType != null)
                {
                    action.Filters.Add(new ProducesResponseTypeAttribute(returnType, StatusCodes.Status200OK));
                    action.Filters.Add(new ProducesResponseTypeAttribute(returnType, StatusCodes.Status500InternalServerError));
                }
                else
                {
                    action.Filters.Add(new ProducesResponseTypeAttribute(StatusCodes.Status200OK));
                    action.Filters.Add(new ProducesResponseTypeAttribute(StatusCodes.Status500InternalServerError));
                }
            }
        }
    }
}