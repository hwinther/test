FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS base
WORKDIR /app
RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src
COPY ["WebApi/WebApi.csproj", "WebApi/"]
COPY ["Directory.Build.props", "./"]
RUN dotnet restore "WebApi/WebApi.csproj"
COPY . .
WORKDIR "/src/WebApi"
RUN dotnet build "WebApi.csproj" -c Release -o /app/build --no-restore
RUN dotnet dev-certs https -v || true

FROM build AS publish
#RUN dotnet publish "WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=true /p:PublishSingleFile=true /p:IncludeNativeCodeInSingleFile=true
RUN dotnet publish "WebApi.csproj" -c Release -o /app/publish

FROM build as otel
#ARG OTEL_VERSION=1.6.0
#ADD https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/download/v${OTEL_VERSION}/otel-dotnet-auto-install.sh otel-dotnet-auto-install.sh
ADD https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest/download/otel-dotnet-auto-install.sh otel-dotnet-auto-install.sh
RUN OTEL_DOTNET_AUTO_HOME="/otel-dotnet-auto" sh ./otel-dotnet-auto-install.sh

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY --from=build /src/WebApi/entrypoint.sh .
# If you need to copy the certificates, ensure they are in the correct location and format
COPY --from=build /root/.dotnet/corefx/cryptography/x509stores/my/* /root/.dotnet/corefx/cryptography/x509stores/my/
# Add OTEL binaries to the published app
COPY --from=otel /otel-dotnet-auto /otel-dotnet-auto
ENV OTEL_DOTNET_AUTO_HOME="/otel-dotnet-auto"
ENV OTEL_SERVICE_NAME=myapp
ENV OTEL_RESOURCE_ATTRIBUTES=deployment.environment=staging,service.version=1.0.0
ENTRYPOINT ["sh", "/app/entrypoint.sh"]
CMD ["dotnet", "WebApi.dll"]
# For self-contained (PublishSingleFile=true)
# CMD ["./WebApi"]