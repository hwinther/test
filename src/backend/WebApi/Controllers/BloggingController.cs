using Microsoft.AspNetCore.Mvc;
using WebApi.Entities;
using WebApi.Repository;

namespace WebApi.Controllers;

/// <summary>
///     Blogging controller
/// </summary>
[ApiController]
[Route("[controller]")]
public class BloggingController(ILogger<BloggingController> logger, IBloggingRepository bloggingRepository) : ControllerBase
{
    /// <summary>
    ///     Gets a list of all blogs.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token to cancel the request.</param>
    /// <returns>A list of BlogDto objects wrapped in an ActionResult.</returns>
    [HttpGet("blog", Name = "GetBlogs")]
    public async Task<ActionResult<IEnumerable<BlogDto>>> GetBlogs(CancellationToken cancellationToken)
    {
        logger.LogInformation("GetBlogs was called");
        return Ok(await bloggingRepository.ListBlogsAsync(cancellationToken));
    }

    /// <summary>
    ///     Gets a specific blog by ID.
    /// </summary>
    /// <param name="id" example="1">The ID of the blog.</param>
    /// <param name="cancellationToken">Cancellation token to cancel the request.</param>
    /// <returns>A single BlogDto object wrapped in an ActionResult. Returns NotFound if the blog does not exist.</returns>
    [HttpGet("blog/{id:int}", Name = "GetBlog")]
    public async Task<ActionResult<BlogDto>> GetBlog(int id, CancellationToken cancellationToken)
    {
        logger.LogInformation("GetBlog was called with id {BlogId}", id);
        var blog = await bloggingRepository.GetBlogAsync(id, cancellationToken);
        if (blog == null)
            return NotFound();

        return blog;
    }

    /// <summary>
    ///     Creates a new blog or updates an existing one.
    /// </summary>
    /// <param name="blog">The blog data transfer object</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Returns the created or updated blog</returns>
    [HttpPost("blog", Name = "PostBlog")]
    public async Task<ActionResult<BlogDto>> PostBlog(BlogDto blog, CancellationToken cancellationToken)
    {
        logger.LogInformation("PostBlog was called");
        var blogEntry = await bloggingRepository.AddOrUpdateBlogAsync(blog, cancellationToken);
        if (blogEntry == null)
            return NotFound();

        return blogEntry;
    }

    /// <summary>
    ///     Gets a list of posts related to a specific blog.
    /// </summary>
    /// <param name="blogId" example="1">The ID of the blog</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Returns a list of posts</returns>
    [HttpGet("blog/{blogId:int}/posts", Name = "GetPosts")]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetPosts(int blogId, CancellationToken cancellationToken)
    {
        logger.LogInformation("GetPosts was called with id {BlogId}", blogId);
        return Ok(await bloggingRepository.ListPostsAsync(blogId, cancellationToken));
    }

    /// <summary>
    ///     Gets a specific post by ID.
    /// </summary>
    /// <param name="id" example="1">The ID of the post</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Returns the requested post</returns>
    [HttpGet("post/{id:int}", Name = "GetPost")]
    public async Task<ActionResult<PostDto>> GetPost(int id, CancellationToken cancellationToken)
    {
        logger.LogInformation("GetPost was called with id {PostId}", id);
        var post = await bloggingRepository.GetPostAsync(id, cancellationToken);
        if (post == null)
            return NotFound();

        return post;
    }

    /// <summary>
    ///     Creates a new post.
    /// </summary>
    /// <param name="post">The post data transfer object</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Returns the created post</returns>
    [HttpPost("post", Name = "PostPost")]
    public async Task<ActionResult<PostDto>> PostPost(PostDto post, CancellationToken cancellationToken)
    {
        logger.LogInformation("PostPost was called");
        var postEntry = await bloggingRepository.AddOrUpdatePostAsync(post, cancellationToken);
        if (postEntry == null)
            return NotFound();

        return postEntry;
    }
}