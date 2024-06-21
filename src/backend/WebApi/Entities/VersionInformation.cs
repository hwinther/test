using System.Reflection;
using WebApi.Attributes;

namespace WebApi.Entities;

/// <summary>
///     Represents version information for an assembly, including constants, environment name, version, and informational
///     version.
/// </summary>
/// <param name="assembly">The assembly to extract version information from.</param>
public class VersionInformation(Assembly assembly)
{
    /// <summary>
    ///     Constants defined in the assembly, if any.
    /// </summary>
    /// <example>["DEBUG","NET8"]</example>
    public string[] Constants { get; private set; } = assembly
                                                      .GetCustomAttribute<DefineConstantsAttribute>()
                                                      ?.Constants ?? [];

    /// <summary>
    ///     The version of the assembly.
    /// </summary>
    /// <example>1.0.0</example>
    public string Version { get; private set; } = assembly.GetCustomAttribute<AssemblyVersionAttribute>()
                                                          ?.Version ?? "n/a";

    /// <summary>
    ///     The informational version of the assembly, which may include additional details.
    /// </summary>
    /// <example>1.0.0-dev</example>
    public string InformationalVersion { get; private set; } = assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>()
                                                                       ?.InformationalVersion ?? "n/a";

    /// <summary>
    ///     The name of the environment where the application is running.
    /// </summary>
    /// <example>Development</example>
    public string EnvironmentName { get; private set; } = Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")
                                                          ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
                                                          ?? "Unknown";
}