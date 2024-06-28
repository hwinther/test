# Backend local development setup

## Start local SQL server

```bash
cd src/backend

# Create docker-volumes directory structure if it doesn't already exist
make dirs

# Run SQL server
podman run --rm -e ACCEPT_EULA=Y -e SA_PASSWORD=DevelopmentOnlyPassword1 -p 1433:1433 -v .\\docker-volumes\\mssql\\data:/var/opt/mssql/data -v .\\docker-volumes\\mssql\\log:/var/opt/mssql/log -v .\\docker-volumes\\mssql\\secrets:/var/opt/mssql/secrets --name mssql-dev -it mcr.microsoft.com/mssql/server:2022-latest
```
