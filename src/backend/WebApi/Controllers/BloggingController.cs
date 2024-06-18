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
    [HttpGet("Blog", Name = "GetBlogs")]
    public async Task<ActionResult<IEnumerable<Blog>>> GetBlogs(CancellationToken cancellationToken)
    {
        logger.LogInformation("GetBlogs was called");
        return await bloggingContext.Blogs.ToListAsync(cancellationToken);
    }

    /// <summary>
    ///     Create blog
    /// </summary>
    /// <returns></returns>
    [HttpPost("Blog", Name = "PostBlog")]
    public async Task<ActionResult<Blog>> PostBlog(Blog blog, CancellationToken cancellationToken)
    {
        logger.LogInformation("PostBlog was called");
        var blogEntry = bloggingContext.Blogs.Add(blog);
        await bloggingContext.SaveChangesAsync(cancellationToken);
        return blogEntry.Entity;
    }

    /// <summary>
    ///     Get posts
    /// </summary>
    /// <returns></returns>
    [HttpGet("Post", Name = "GetPosts")]
    public async Task<ActionResult<IEnumerable<Post>>> GetPosts(CancellationToken cancellationToken)
    {
        logger.LogInformation("GetPosts was called");
        return await bloggingContext.Posts.ToListAsync(cancellationToken);
    }

    /// <summary>
    ///     Create post
    /// </summary>
    /// <returns></returns>
    [HttpPost("Post", Name = "PostPost")]
    public async Task<ActionResult<Post>> PostPost(Post post, CancellationToken cancellationToken)
    {
        logger.LogInformation("PostPost was called");
        var postEntry = bloggingContext.Posts.Add(post);
        await bloggingContext.SaveChangesAsync(cancellationToken);
        return postEntry.Entity;
    }
}