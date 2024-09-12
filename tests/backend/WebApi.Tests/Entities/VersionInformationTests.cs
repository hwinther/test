using System.Reflection;
using Moq;
using WebApi.Attributes;
using WebApi.Entities;

namespace WebApi.Tests.Entities;

[TestFixture]
public class VersionInformationTests
{
    [SetUp]
    public void SetUp()
    {
        _assemblyMock = new Mock<Assembly>();
    }
    private Mock<Assembly> _assemblyMock;

    [Test]
    public void ConstantsProperty_ExtractsConstantsCorrectly()
    {
        // Arrange
        var expectedConstants = new[]
        {
            "DEBUG", "NET8"
        };

        _assemblyMock.Setup(static a => a.GetCustomAttribute<DefineConstantsAttribute>())
                     .Returns(new DefineConstantsAttribute("\"DEBUG;NET8\""));

        // Act
        var versionInformation = new VersionInformation(_assemblyMock.Object);

        // Assert
        Assert.That(versionInformation.Constants, Is.EqualTo(expectedConstants));
    }

    [Test]
    public void VersionProperty_ExtractsVersionCorrectly()
    {
        // Arrange
        var expectedVersion = "1.0.0";
        _assemblyMock.Setup(static a => a.GetCustomAttribute<AssemblyVersionAttribute>())
                     .Returns(new AssemblyVersionAttribute(expectedVersion));

        // Act
        var versionInformation = new VersionInformation(_assemblyMock.Object);

        // Assert
        Assert.That(versionInformation.Version, Is.EqualTo(expectedVersion));
    }

    [Test]
    public void InformationalVersionProperty_ExtractsInformationalVersionCorrectly()
    {
        // Arrange
        var expectedInformationalVersion = "1.0.0-dev";
        _assemblyMock.Setup(static a => a.GetCustomAttribute<AssemblyInformationalVersionAttribute>())
                     .Returns(new AssemblyInformationalVersionAttribute(expectedInformationalVersion));

        // Act
        var versionInformation = new VersionInformation(_assemblyMock.Object);

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
        var versionInformation = new VersionInformation(_assemblyMock.Object);

        // Assert
        Assert.That(versionInformation.EnvironmentName, Is.EqualTo("Unknown"));
    }
}