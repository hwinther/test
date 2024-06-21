namespace WebApi.Attributes;

/// <summary>
///     Defines a custom attribute to specify constants at the assembly level.
/// </summary>
/// <param name="constants">A string containing the constants definitions.</param>
[AttributeUsage(AttributeTargets.Assembly)]
public class DefineConstantsAttribute(string constants) : Attribute
{
    /// <summary>
    ///     Gets the constants defined for the assembly.
    /// </summary>
    public string[] Constants { get; } = constants[1..^1]
        .Split(";", StringSplitOptions.RemoveEmptyEntries);
}