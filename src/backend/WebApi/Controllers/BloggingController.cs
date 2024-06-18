using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Controllers;

/// <summary>
///     Blogging controller
/// </summary>
[ApiController]
[Route("[controller]")]
public class BloggingController(ILogger<BloggingController> logger, BloggingContext bloggingContext) : ControllerBase
{
    /// <summary>
    ///     Get blogs
    /// </summary>
    /// <returns></returns>
    [HttpGet("Blogs", Name = "GetBlogs")]
    public async Task<ActionResult<IEnumerable<Blog>>> GetBlogs()
    {
        logger.LogInformation("GetBlogs was called");
        return await bloggingContext.Blogs.ToListAsync();
    }

    /// <summary>
    ///     Get posts
    /// </summary>
    /// <returns></returns>
    [HttpGet("Posts", Name = "GetPosts")]
    public async Task<ActionResult<IEnumerable<Post>>> GetPosts()
    {
        logger.LogInformation("GetPosts was called");
        return await bloggingContext.Posts.ToListAsync();
    }
}