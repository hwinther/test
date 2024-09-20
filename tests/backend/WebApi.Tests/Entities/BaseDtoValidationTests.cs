using System.ComponentModel.DataAnnotations;

namespace WebApi.Tests.Entities;

public class BaseDtoValidationTests<T>
    where T : IValidatableObject
{
    protected static void Validate_ReturnsValidationError(T dto, string expectedErrorMessage)
    {
        // Arrange
        var validationContext = new ValidationContext(dto);

        // Act
        var results = dto.Validate(validationContext)
                         .ToList();

        // Assert
        Assert.That(results, Has.Count.EqualTo(1));
        Assert.That(results[0].ErrorMessage, Is.EqualTo(expectedErrorMessage));
    }
}