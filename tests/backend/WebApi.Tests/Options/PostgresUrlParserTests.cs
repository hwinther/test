using Npgsql;
using WebApi.Options;

namespace WebApi.Tests.Options;

public class PostgresUrlParserTests
{
    [Fact]
    public void A_native_connection_string_is_left_as_it_is()
    {
        const string native = "Host=db;Database=blogging;Username=app";
        Assert.Equal(native, PostgresUrlParser.Parse(native));
    }

    [Fact]
    public void Parses_every_part_of_a_url()
    {
        var parsed = new NpgsqlConnectionStringBuilder(
            PostgresUrlParser.Parse("postgresql://app%40x:p%3Ass@db.test:6543/my%20db?sslmode=Require&Timeout=5&="));

        Assert.Equal("db.test", parsed.Host);
        Assert.Equal(6543, parsed.Port);
        Assert.Equal("my db", parsed.Database);
        Assert.Equal("app@x", parsed.Username);
        Assert.Equal("p:ss", parsed.Password);
        Assert.Equal(SslMode.Require, parsed.SslMode);
        Assert.Equal(5, parsed.Timeout);
    }

    [Fact]
    public void A_minimal_url_gets_the_default_port_and_no_credentials()
    {
        var parsed = new NpgsqlConnectionStringBuilder(PostgresUrlParser.Parse("POSTGRES://db"));

        Assert.Equal("db", parsed.Host);
        Assert.Equal(5432, parsed.Port);
        Assert.Null(parsed.Database);
        Assert.Null(parsed.Username);
        Assert.Null(parsed.Password);
    }

    [Fact]
    public void A_user_without_a_password()
    {
        var parsed = new NpgsqlConnectionStringBuilder(PostgresUrlParser.Parse("postgres://reader@db/blogging"));

        Assert.Equal("reader", parsed.Username);
        Assert.Null(parsed.Password);
        Assert.Equal("blogging", parsed.Database);
    }
}
