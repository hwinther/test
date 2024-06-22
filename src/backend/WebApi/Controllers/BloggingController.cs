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
    ///     Get blogs
    /// </summary>
    /// <returns></returns>
    [HttpGet("blog", Name = "GetBlogs")]
    public async Task<ActionResult<IEnumerable<BlogDto>>> GetBlogs(CancellationToken cancellationToken)
    {
        logger.LogInformation("GetBlogs was called");
        return Ok(await bloggingRepository.ListBlogsAsync(cancellationToken));
    }

    /// <summary>
    ///     Get specific blog
    /// </summary>
    /// <returns></returns>
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
    ///     Create or update blog
    /// </summary>
    /// <returns></returns>
    [HttpPost("blog", Name = "PostBlog")]
    public async Task<ActionResult<BlogDto>> PostBlog(BlogDto blog, CancellationToken cancellationToken)
    {
        logger.LogInformation("PostBlog was called");
        var blogEntry = await bloggingRepository.AddBlogAsync(blog, cancellationToken);
        if (blogEntry == null)
            return NotFound();

        return blogEntry;
    }

    /// <summary>
    ///     Get posts related to a blog
    /// </summary>
    /// <returns></returns>
    [HttpGet("blog/{blogId:int}/posts", Name = "GetPosts")]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetPosts(int blogId, CancellationToken cancellationToken)
    {
        logger.LogInformation("GetPosts was called with id {BlogId}", blogId);
        return Ok(await bloggingRepository.ListPostsAsync(blogId, cancellationToken));
    }

    /// <summary>
    ///     Get specific post by id
    /// </summary>
    /// <returns></returns>
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
    ///     Create or update post
    /// </summary>
    /// <returns></returns>
    [HttpPost("post", Name = "PostPost")]
    public async Task<ActionResult<PostDto>> PostPost(PostDto post, CancellationToken cancellationToken)
    {
        logger.LogInformation("PostPost was called");
        var postEntry = await bloggingRepository.AddPostAsync(post, cancellationToken);
        if (postEntry == null)
            return NotFound();

        return postEntry;
    }
}