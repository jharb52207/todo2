FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/TodoApi/TodoApi.csproj", "TodoApi/"]
COPY ["src/TodoApi.Shared/TodoApi.Shared.csproj", "TodoApi.Shared/"]
RUN dotnet restore "TodoApi/TodoApi.csproj"
COPY src/TodoApi/ TodoApi/
COPY src/TodoApi.Shared/ TodoApi.Shared/
WORKDIR /src/TodoApi
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TodoApi.dll"]
