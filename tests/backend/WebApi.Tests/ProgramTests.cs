using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace WebApi.Tests;

public class ProgramTests : IAsyncDisposable
{
    private readonly CustomWebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public ProgramTests()
    {
        _factory = new CustomWebApplicationFactory<Program>();
        _client = _factory.CreateClient();
    }

    public async ValueTask DisposeAsync() => await _factory.DisposeAsync();

    [Fact]
    public async Task GetSwaggerIndex_ReturnsOkResult()
    {
        // Act
        var response = await _client.GetAsync("/swagger/index.html", TestContext.Current.CancellationToken);

        // Assert
        Assert.NotNull(response);
        response.EnsureSuccessStatusCode();
        Assert.NotNull(response.Content.Headers.ContentType);
        Assert.Equal("text/html; charset=utf-8", response.Content.Headers.ContentType.ToString());
    }
}

public class CustomWebApplicationFactory<TProgram>
    : WebApplicationFactory<TProgram> where TProgram : class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
    }
}