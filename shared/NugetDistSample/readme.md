# Example nuget package that distributes props and other files

This is an example of a nuget package that distributes props and other files.

Add it like this to avoid the assets becoming transient in other projects:

```xml
    <PackageReference Include="nuget_distribution_example" Version="0.0.32">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
```

## How to create a nuget package
```pwsh
# Add the github nuget source:
dotnet nuget add source --username hwinther --password <INSERT_PAT_HERE> --store-password-in-clear-text --name github "https://nuget.pkg.github.com/hwinther/index.json"

# Create the package
$Env:GITHUB_API_KEY="INSERT_PAT_HERE"
& ./release.ps1
```
