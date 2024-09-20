using WebApi.Entities;

namespace WebApi.Tests;

internal static class MockObjects
{
    internal static readonly BlogDto MockBlog = new()
    {
        BlogId = 1,
        Title = "Test blog",
        Url = "test://url"
    };

    internal static readonly PostDto MockPost = new()
    {
        BlogId = 1,
        PostId = 1,
        Title = "Test post",
        Content = "Test content"
    };

    internal static BlogDto MockBlogFactory(int id) =>
        MockBlog with
        {
            BlogId = id,
            Title = $"Blog entry {id}"
        };

    internal static PostDto MockPostFactory(int id) =>
        MockPost with
        {
            PostId = id,
            Title = $"Post entry {id}"
        };
}