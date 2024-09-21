using Testcontainers.MsSql;

namespace WebApi.Tests.Database;

/// <summary>
///     MsSql test container base class
/// </summary>
/// <param name="msSqlContainer"></param>
public class MsSqlContainerTest(MsSqlContainer msSqlContainer) : IAsyncDisposable
{
    public readonly MsSqlContainer MsSqlContainer = msSqlContainer;
    public async ValueTask DisposeAsync() => await MsSqlContainer.DisposeAsync();
    public Task InitializeAsync() => MsSqlContainer.StartAsync();
}