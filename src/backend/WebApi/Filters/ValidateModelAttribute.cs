using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace WebApi.Filters;

/// <summary>
///     TODO
/// </summary>
public class ValidateModelAttribute : ActionFilterAttribute
{
    /// <inheritdoc />
    public override void OnActionExecuting(ActionExecutingContext actionExecutingContext)
    {
        if (!actionExecutingContext.ModelState.IsValid)
            actionExecutingContext.Result = new BadRequestObjectResult(actionExecutingContext.ModelState);
    }
}