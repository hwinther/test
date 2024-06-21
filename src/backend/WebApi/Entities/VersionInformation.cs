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
    public string[] Constants { get; private set; } = assembly
                                                      .GetCustomAttribute<DefineConstantsAttribute>()
                                                      ?.Constants ?? [];

    /// <summary>
    ///     The version of the assembly.
    /// </summary>
    public string Version { get; private set; } = assembly.GetCustomAttribute<AssemblyVersionAttribute>()
                                                          ?.Version ?? "n/a";

    /// <summary>
    ///     The informational version of the assembly, which may include additional details.
    /// </summary>
    public string InformationalVersion { get; private set; } = assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>()
                                                                       ?.InformationalVersion ?? "n/a";

    /// <summary>
    ///     The name of the environment where the application is running.
    /// </summary>
    public string EnvironmentName { get; private set; } = Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")
                                                          ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
                                                          ?? "Unknown";
}