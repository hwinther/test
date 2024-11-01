using System.Diagnostics;
using System.Globalization;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;

if (args.Length == 2)
{
    var msbuildDir = args[0];
    var solutionDir = args[1];
    Console.WriteLine($"MsbuildDir: {msbuildDir}");
    Console.WriteLine($"SolutionDir: {solutionDir}");

    var solutionSignature = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(solutionDir));
    var cachePath = Path.Combine(msbuildDir, "..", $"cached-run-{solutionSignature}");
    if (Path.Exists(cachePath))
    {
        Console.WriteLine("Already executed for this solution.");
        return;
    }

    var gitFolderPath = FindGitFolder(solutionDir);
    if (gitFolderPath == null)
    {
        Console.WriteLine(".git folder not found.");
        return;
    }

    Console.WriteLine($".git folder found at: {gitFolderPath}");

    var gitIgnorePath = Path.Combine(gitFolderPath, ".gitignore");
    AddGitIgnoreLineRegex(gitIgnorePath, "**/.idea/**", IdeaRegex());

    RecursivelyCopyContent(Path.Combine(msbuildDir, "..", "content"), gitFolderPath);

    var hooksAdded = ExecuteCommandIfLineDoesNotExist(Path.Combine(gitFolderPath, ".git", "config"), "hooksPath = .githooks", "git config --local core.hooksPath .githooks");
    Console.WriteLine(hooksAdded ? "Git hooks path set." : "Git hooks path already set.");

    File.WriteAllText(cachePath, DateTime.Now.ToString(CultureInfo.InvariantCulture));
}
else
{
    Console.WriteLine("Usage: NugetDistSample <MsbuildDir> <SolutionDir>");
}

return;

static string? FindGitFolder(string? directory)
{
    while (!string.IsNullOrEmpty(directory))
    {
        if (Directory.Exists(Path.Combine(directory, ".git")))
            return directory;

        directory = Directory.GetParent(directory)
                             ?.FullName;
    }

    return null;
}

static bool ExecuteCommandIfLineDoesNotExist(string filePath, string line, string command)
{
    var lines = File.ReadAllLines(filePath);
    if (lines.Contains(line))
        return false;

    Console.WriteLine($"Executing: {command}");

    ProcessStartInfo processStartInfo = new()
    {
        WorkingDirectory = Path.GetDirectoryName(filePath),
        UseShellExecute = false,
        CreateNoWindow = true
    };

    if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
    {
        processStartInfo.FileName = "cmd";
        processStartInfo.Arguments = $"/c {command}";
    }
    else
    {
        processStartInfo.FileName = "sh";
        processStartInfo.Arguments = $"-c \"{command}\"";
    }

    var process = Process.Start(processStartInfo);

    if (process == null)
        return false;

    if (process.WaitForExit(5000))
        return true;

    Console.WriteLine("Timeout waiting for process to exit.");
    process.Kill(true);
    return false;
}

static void AddGitIgnoreLineRegex(string gitIgnorePath, string line, Regex match)
{
    var lines = File.ReadAllLines(gitIgnorePath);
    if (Array.Exists(lines, match.IsMatch))
        return;

    Console.WriteLine($"Adding line to .gitignore: {line}");
    File.AppendAllLines(gitIgnorePath,
                        new[]
                        {
                            line
                        });
}

static void RecursivelyCopyContent(string sourceFolder, string destinationFolder)
{
    foreach (var sourceSubFolder in Directory.GetDirectories(sourceFolder))
    {
        var destinationSubFolder = Path.Combine(destinationFolder, Path.GetFileName(sourceSubFolder));
        if (!Directory.Exists(destinationSubFolder))
        {
            Console.WriteLine($"Creating directory: {destinationSubFolder}");
            Directory.CreateDirectory(destinationSubFolder);
        }

        RecursivelyCopyContent(sourceSubFolder, destinationSubFolder);
    }

    foreach (var sourceFile in Directory.GetFiles(sourceFolder))
    {
        var destinationFile = Path.Combine(destinationFolder, Path.GetFileName(sourceFile));

        Console.WriteLine($"Copying file: {sourceFile} -> {destinationFile}");
        File.Copy(sourceFile, destinationFile, true);
    }
}

internal partial class Program
{
    [GeneratedRegex(@".*\.idea.*")]
    private static partial Regex IdeaRegex();
}