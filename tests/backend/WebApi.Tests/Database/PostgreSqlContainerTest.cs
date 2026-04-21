using Testcontainers.PostgreSql;

namespace WebApi.Tests.Database;

/// <summary>
///     PostgreSql test container base class
/// </summary>
/// <param name="postgreSqlContainer"></param>
public class PostgreSqlContainerTest(PostgreSqlContainer postgreSqlContainer) : IAsyncDisposable
{
    public readonly PostgreSqlContainer PostgreSqlContainer = postgreSqlContainer;
    public async ValueTask DisposeAsync() => await PostgreSqlContainer.DisposeAsync();
    public Task InitializeAsync() => PostgreSqlContainer.StartAsync();
}