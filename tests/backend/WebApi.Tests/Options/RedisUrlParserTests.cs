using System.Net;
using WebApi.Options;

namespace WebApi.Tests.Options;

public class RedisUrlParserTests
{
    [Fact]
    public void A_native_connection_string_goes_to_StackExchange_Redis()
    {
        var options = RedisUrlParser.Parse("cache:6380,password=secret");

        var endpoint = Assert.IsType<DnsEndPoint>(Assert.Single(options.EndPoints));
        Assert.Equal(("cache", 6380), (endpoint.Host, endpoint.Port));
        Assert.Equal("secret", options.Password);
    }

    [Fact]
    public void Parses_a_tls_url_with_password_and_database()
    {
        var options = RedisUrlParser.Parse("rediss://:p%40ss@cache.test:6390/3");

        var endpoint = Assert.IsType<DnsEndPoint>(Assert.Single(options.EndPoints));
        Assert.Equal(("cache.test", 6390), (endpoint.Host, endpoint.Port));
        Assert.Equal("p@ss", options.Password);
        Assert.Equal(3, options.DefaultDatabase);
        Assert.True(options.Ssl);
    }

    [Fact]
    public void A_bare_url_gets_the_default_port_and_no_password()
    {
        var options = RedisUrlParser.Parse("redis://cache");

        var endpoint = Assert.IsType<DnsEndPoint>(Assert.Single(options.EndPoints));
        Assert.Equal(6379, endpoint.Port);
        Assert.Null(options.Password);
        Assert.Null(options.DefaultDatabase);
        Assert.False(options.Ssl);
    }

    [Theory]
    [InlineData("redis://secret@cache", "secret")]
    [InlineData("redis://user:@cache", null)]
    public void The_user_info_is_the_password(string url, string? password) =>
        Assert.Equal(password, RedisUrlParser.Parse(url).Password);
}
