using System.Reflection;
using System.Reflection.Emit;
using WebApi.Attributes;
using WebApi.Entities;

namespace WebApi.Tests.Entities;

public class VersionInformationTests
{
    private static Assembly CreateFakeAssembly<T>(params object[] constructorArgs)
        where T : Attribute
    {
        var type = typeof(T);
        var constructor = type.GetConstructor([typeof(string)]) ?? throw new InvalidOperationException($"Could not get constructor for {type.Name}");

        var assemblyBuilder = AssemblyBuilder.DefineDynamicAssembly(new AssemblyName($"{type.Name}.FakeAssembly"),
                                                                    AssemblyBuilderAccess.RunAndCollect,
                                                                    [
                                                                        new CustomAttributeBuilder(constructor,
                                                                                                   constructorArgs)
                                                                    ]) ?? throw new InvalidOperationException($"Failed to build assembly for {type.Name}");

        var assemblyFake = assemblyBuilder.Modules.First()
                                          .Assembly;

        return assemblyFake;
    }

    [Fact]
    public void ConstantsProperty_ExtractsConstantsCorrectly()
    {
        // Arrange
        var expectedConstants = new[]
        {
            "DEBUG", "NET8"
        };

        var assemblyFake = CreateFakeAssembly<DefineConstantsAttribute>("\"DEBUG;NET8\"");

        // Act
        var versionInformation = new VersionInformation(assemblyFake);

        // Assert
        Assert.Equal(expectedConstants, versionInformation.Constants);
    }

    [Fact]
    public void VersionProperty_ExtractsVersionCorrectly()
    {
        // Arrange
        const string expectedVersion = "1.0.0";
        var assemblyFake = CreateFakeAssembly<AssemblyVersionAttribute>(expectedVersion);

        // Act
        var versionInformation = new VersionInformation(assemblyFake);

        // Assert
        Assert.Equal(expectedVersion, versionInformation.Version);
    }

    [Fact]
    public void InformationalVersionProperty_ExtractsInformationalVersionCorrectly()
    {
        // Arrange
        const string expectedInformationalVersion = "1.0.0-dev";
        var assemblyFake = CreateFakeAssembly<AssemblyInformationalVersionAttribute>(expectedInformationalVersion);

        // Act
        var versionInformation = new VersionInformation(assemblyFake);

        // Assert
        Assert.Equal(expectedInformationalVersion, versionInformation.InformationalVersion);
    }

    [Fact]
    public void EnvironmentNameProperty_FallbacksToUnknownWhenNoEnvironmentVariablesSet()
    {
        // Arrange
        Environment.SetEnvironmentVariable("DOTNET_ENVIRONMENT", null);
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", null);

        // Act
        var versionInformation = new VersionInformation(typeof(VersionInformationTests).Assembly);

        // Assert
        Assert.Equal("Unknown", versionInformation.EnvironmentName);
    }
}