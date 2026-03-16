using Testcontainers.MsSql;

namespace WebApi.Tests.Database;

#pragma warning disable S2094 // Classes should not be empty
public sealed class MsSqlDefaultConfiguration() : MsSqlContainerTest(new MsSqlBuilder("mcr.microsoft.com/mssql/server:2022-CU14-ubuntu-22.04")
                                                                         .Build());
#pragma warning restore S2094 // Classes should not be empty