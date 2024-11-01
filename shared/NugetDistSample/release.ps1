dotnet clean -c Release .\NugetDistSample.csproj

# Read the .csproj file
$filePath = Resolve-Path ".\NugetDistSample.csproj"
$csproj=New-Object XML
$csproj.Load($filePath)

# Find the <Version> element
$versionElement = $csproj.Project.PropertyGroup.Version

if ($versionElement -ne $null) {
    # Split the version number into its components
    $versionParts = $versionElement.Split('.')
    if ($versionParts.Length -eq 3) {
        # Increment the patch version
        $versionParts[2] = [int]$versionParts[2] + 1
        # Join the version parts back together
        $newVersion = "$($versionParts[0]).$($versionParts[1]).$($versionParts[2])"
        # Update the <Version> element
        $csproj.Project.PropertyGroup.Version = $newVersion
        # Save the updated .csproj file
        $csproj.Save($filePath)
        Write-Output "Version updated to $newVersion"
    } else {
        Write-Error "Version format is not valid. Expected format: x.y.z"
    }
} else {
    Write-Error "<Version> element not found in the .csproj file."
}

dotnet build -c Release .\NugetDistSample.csproj
dotnet pack -c Release .\NugetDistSample.csproj
dotnet nuget push .\bin\Release\nuget_distribution_example.*.nupkg --api-key $Env:GITHUB_API_KEY --source github --skip-duplicate
