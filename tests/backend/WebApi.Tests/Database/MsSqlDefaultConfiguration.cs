using Testcontainers.MsSql;

namespace WebApi.Tests.Database;

#pragma warning disable S2094 // Classes should not be empty
public sealed class MsSqlDefaultConfiguration() : MsSqlContainerTest(new MsSqlBuilder().Build());
#pragma warning restore S2094 // Classes should not be empty