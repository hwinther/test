namespace WebApi.Options;

/// <summary>
///     OIDC / JWT Bearer settings (binds configuration section <c>Oidc</c>).
/// </summary>
public sealed class OidcOptions
{
    /// <summary>Name of the configuration section.</summary>
    public const string SectionName = "Oidc";

    /// <summary>Issuer / authority base URL — OIDC discovery is fetched from <c>{Authority}/.well-known/openid-configuration</c>.</summary>
    public string Authority { get; set; } = "https://auth.wsh.no";

    /// <summary>Expected <c>aud</c> claim in incoming JWT access tokens.</summary>
    public string Audience { get; set; } = "pxce";
}
