using System.Reflection;
using System.Reflection.Emit;
using WebApi.Attributes;
using WebApi.Entities;

namespace WebApi.Tests.Entities;

[TestFixture]
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

    [Test]
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
        Assert.That(versionInformation.Constants, Is.EqualTo(expectedConstants));
    }

    [Test]
    public void VersionProperty_ExtractsVersionCorrectly()
    {
        // Arrange
        const string expectedVersion = "1.0.0";
        var assemblyFake = CreateFakeAssembly<AssemblyVersionAttribute>(expectedVersion);

        // Act
        var versionInformation = new VersionInformation(assemblyFake);

        // Assert
        Assert.That(versionInformation.Version, Is.EqualTo(expectedVersion));
    }

    [Test]
    public void InformationalVersionProperty_ExtractsInformationalVersionCorrectly()
    {
        // Arrange
        const string expectedInformationalVersion = "1.0.0-dev";
        var assemblyFake = CreateFakeAssembly<AssemblyInformationalVersionAttribute>(expectedInformationalVersion);

        // Act
        var versionInformation = new VersionInformation(assemblyFake);

        // Assert
        Assert.That(versionInformation.InformationalVersion, Is.EqualTo(expectedInformationalVersion));
    }

    [Test]
    public void EnvironmentNameProperty_FallbacksToUnknownWhenNoEnvironmentVariablesSet()
    {
        // Arrange
        Environment.SetEnvironmentVariable("DOTNET_ENVIRONMENT", null);
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", null);

        // Act
        var versionInformation = new VersionInformation(typeof(VersionInformationTests).Assembly);

        // Assert
        Assert.That(versionInformation.EnvironmentName, Is.EqualTo("Unknown"));
    }
}