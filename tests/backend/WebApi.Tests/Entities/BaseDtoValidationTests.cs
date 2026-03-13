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
        var single = Assert.Single(results);
        Assert.Equal(expectedErrorMessage, single.ErrorMessage);
    }
}