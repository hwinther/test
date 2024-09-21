using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using Moq;

namespace WebApi.Tests;

internal static class MockHelper
{
    public static void VerifyLog<T>(this Mock<ILogger<T>> loggerMock, LogLevel level, Times times, string? regex = null) =>
        loggerMock.Verify(logger => logger.Log(
                              level,
                              It.IsAny<EventId>(),
                              It.Is<It.IsAnyType>((x, y) => regex == null || Regex.IsMatch(x.ToString() ?? string.Empty, regex)),
                              It.IsAny<Exception?>(),
                              It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
                          times);
}