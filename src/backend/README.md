# Backend local development setup

## Start local SQL server

```bash
cd src/backend

# Create docker-volumes directory structure if it doesn't already exist
make dirs

# Run SQL server
podman run --rm -e ACCEPT_EULA=Y -e SA_PASSWORD=DevelopmentOnlyPassword1 -p 1433:1433 -v .\\docker-volumes\\mssql\\data:/var/opt/mssql/data -v .\\docker-volumes\\mssql\\log:/var/opt/mssql/log -v .\\docker-volumes\\mssql\\secrets:/var/opt/mssql/secrets --name mssql-dev -it mcr.microsoft.com/mssql/server:2022-latest
```

## Start local backend instance

```bash
# Windows
set ASPNETCORE_ENVIRONMENT=Development
set DB_CONNECTION="Server=127.0.0.1,1433;Initial Catalog=api;User=sa;Password=DevelopmentOnlyPassword1;TrustServerCertificate=True;"

# Linux/mac
ASPNETCORE_ENVIRONMENT=Development
DB_CONNECTION="Server=127.0.0.1,1433;Initial Catalog=api;User=sa;Password=DevelopmentOnlyPassword1;TrustServerCertificate=True;"

# TODO: broken due to docker compose solution file
dotnet run WebApi

# Current method:
cd src/backend/WebApi
dotnet run -lp "https swagger"
```
