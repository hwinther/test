using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using WebApi.Filters;

namespace WebApi.Tests.Filters;

public class ValidateModelAttributeTests
{
    private static ActionExecutingContext Context()
    {
        var action = new ActionContext(new DefaultHttpContext(), new RouteData(), new ActionDescriptor());
        return new ActionExecutingContext(action, [], new Dictionary<string, object?>(), new object());
    }

    [Fact]
    public void A_valid_model_runs_the_action()
    {
        var context = Context();
        new ValidateModelAttribute().OnActionExecuting(context);
        Assert.Null(context.Result);
    }

    [Fact]
    public void An_invalid_model_answers_400_with_the_errors()
    {
        var context = Context();
        context.ModelState.AddModelError("Title", "Required");

        new ValidateModelAttribute().OnActionExecuting(context);

        var result = Assert.IsType<BadRequestObjectResult>(context.Result);
        var errors = Assert.IsType<SerializableError>(result.Value);
        Assert.Equal(["Required"], Assert.IsType<string[]>(errors["Title"]));
    }
}
