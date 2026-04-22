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

    /// <summary>OAuth 2.0 client_id registered with the identity provider. Used by Swagger UI to initiate the PKCE flow.</summary>
    public string ClientId { get; set; } = "pxce";

    /// <summary>Expected <c>aud</c> claim in incoming JWT access tokens. Identifies this resource server, not the client.</summary>
    public string Audience { get; set; } = "pxce-api";
}
