using Microsoft.EntityFrameworkCore;
using WebApi.Database;
using WebApi.Entities;

namespace WebApi.Repository;

/// <summary>
///     Defines the interface for blogging repository operations, including listing, retrieving, and adding blogs and
///     posts.
/// </summary>
public interface IBloggingRepository
{
    /// <summary>
    ///     Lists all blogs asynchronously.
    /// </summary>
    /// <param name="cancellationToken">A token to cancel the asynchronous operation.</param>
    /// <returns>
    ///     A task that represents the asynchronous operation. The task result contains a collection of
    ///     <see cref="BlogDto" />.
    /// </returns>
    Task<IEnumerable<BlogDto>> ListBlogsAsync(CancellationToken cancellationToken);

    /// <summary>
    ///     Retrieves a blog by its ID asynchronously.
    /// </summary>
    /// <param name="id">The ID of the blog to retrieve.</param>
    /// <param name="cancellationToken">A token to cancel the asynchronous operation.</param>
    /// <returns>
    ///     A task that represents the asynchronous operation. The task result contains the <see cref="BlogDto" /> if
    ///     found; otherwise, null.
    /// </returns>
    Task<BlogDto?> GetBlogAsync(int id, CancellationToken cancellationToken);

    /// <summary>
    ///     Adds a new blog asynchronously.
    /// </summary>
    /// <param name="blog">The blog to add.</param>
    /// <param name="cancellationToken">A token to cancel the asynchronous operation.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the added <see cref="BlogDto" />.</returns>
    Task<BlogDto?> AddOrUpdateBlogAsync(BlogDto blog, CancellationToken cancellationToken);

    /// <summary>
    ///     Lists all posts asynchronously.
    /// </summary>
    /// <param name="blogId">The ID of the blog to retrieve posts for.</param>
    /// <param name="cancellationToken">A token to cancel the asynchronous operation.</param>
    /// <returns>
    ///     A task that represents the asynchronous operation. The task result contains a collection of
    ///     <see cref="PostDto" />.
    /// </returns>
    Task<IEnumerable<PostDto>> ListPostsAsync(int blogId, CancellationToken cancellationToken);

    /// <summary>
    ///     Retrieves a post by its ID asynchronously.
    /// </summary>
    /// <param name="id">The ID of the post to retrieve.</param>
    /// <param name="cancellationToken">A token to cancel the asynchronous operation.</param>
    /// <returns>
    ///     A task that represents the asynchronous operation. The task result contains the <see cref="PostDto" /> if
    ///     found; otherwise, null.
    /// </returns>
    Task<PostDto?> GetPostAsync(int id, CancellationToken cancellationToken);

    /// <summary>
    ///     Adds a new post asynchronously.
    /// </summary>
    /// <param name="post">The post to add.</param>
    /// <param name="cancellationToken">A token to cancel the asynchronous operation.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the added <see cref="PostDto" />.</returns>
    Task<PostDto?> AddOrUpdatePostAsync(PostDto post, CancellationToken cancellationToken);
}

/// <summary>
///     Repository for blogging operations
/// </summary>
/// <param name="bloggingContext"></param>
public class BloggingRepository(BloggingContext bloggingContext) : IBloggingRepository
{
    /// <inheritdoc />
    public async Task<IEnumerable<BlogDto>> ListBlogsAsync(CancellationToken cancellationToken) => BlogDto.FromEntity(await bloggingContext.Blogs.ToListAsync(cancellationToken));

    /// <inheritdoc />
    public async Task<BlogDto?> GetBlogAsync(int id, CancellationToken cancellationToken)
    {
        var blog = await bloggingContext.Blogs.FindAsync([
                                                             id
                                                         ],
                                                         cancellationToken);

        return blog == null ? null : BlogDto.FromEntity(blog);
    }

    /// <inheritdoc />
    public async Task<BlogDto?> AddOrUpdateBlogAsync(BlogDto blog, CancellationToken cancellationToken)
    {
        if (blog.BlogId != 0)
        {
            var blogEntity = await bloggingContext.Blogs.FindAsync([
                                                                       blog.BlogId
                                                                   ],
                                                                   cancellationToken);

            if (blogEntity == null)
                return null;

            // Update
            blogEntity.Title = blog.Title;
            blogEntity.Url = blog.Url;

            await bloggingContext.SaveChangesAsync(cancellationToken);
            return BlogDto.FromEntity(blogEntity);
        }

        // Add
        var createdBlogEntity = bloggingContext.Blogs.Add(new Blog
        {
            Url = blog.Url,
            Title = blog.Title
        });

        await bloggingContext.SaveChangesAsync(cancellationToken);
        return BlogDto.FromEntity(createdBlogEntity.Entity);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<PostDto>> ListPostsAsync(int blogId, CancellationToken cancellationToken) =>
        PostDto.FromEntity(await bloggingContext.Posts
                                                .Where(p => p.BlogId == blogId)
                                                .ToListAsync(cancellationToken));

    /// <inheritdoc />
    public async Task<PostDto?> GetPostAsync(int id, CancellationToken cancellationToken)
    {
        var post = await bloggingContext.Posts.FindAsync([
                                                             id
                                                         ],
                                                         cancellationToken);

        return post == null ? null : PostDto.FromEntity(post);
    }

    /// <inheritdoc />
    public async Task<PostDto?> AddOrUpdatePostAsync(PostDto post, CancellationToken cancellationToken)
    {
        if (post.PostId != 0)
        {
            var postEntity = await bloggingContext.Posts.FindAsync([
                                                                       post.PostId
                                                                   ],
                                                                   cancellationToken);

            if (postEntity == null)
                return null;

            // Update existing post
            postEntity.Title = post.Title;
            postEntity.Content = post.Content;

            await bloggingContext.SaveChangesAsync(cancellationToken);
            return PostDto.FromEntity(postEntity);
        }

        // Add new post
        var createdPostEntity = bloggingContext.Posts.Add(new Post
        {
            BlogId = post.BlogId,
            Title = post.Title,
            Content = post.Content
        });

        await bloggingContext.SaveChangesAsync(cancellationToken);
        return PostDto.FromEntity(createdPostEntity.Entity);
    }
}