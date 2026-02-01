using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using TodoApi.Data;
using TodoApi.Models;
using TodoApi.Shared.DTOs;
using TodoApi.Tests.Fixtures;

namespace TodoApi.Tests.Integration;

public class AuthEndpointTests : IClassFixture<TodoApiFactory>
{
    private readonly HttpClient _client;
    private readonly TodoApiFactory _factory;

    public AuthEndpointTests(TodoApiFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task RequestMagicLink_ValidEmail_Returns200()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/request-magic-link",
            new RequestMagicLinkRequest("test@localhost"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task RequestMagicLink_EmptyEmail_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/request-magic-link",
            new RequestMagicLinkRequest(""));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ConfirmMagicLink_InvalidToken_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/confirm-magic-link",
            new ConfirmMagicLinkRequest("invalid-token"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ConfirmMagicLink_ValidToken_ReturnsJwt()
    {
        // Arrange: seed a user and valid token directly in the DB
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<TodoDbContext>();
        var user = new User { Email = "flow@localhost" };
        db.Users.Add(user);
        var token = new MagicLinkToken
        {
            Email = "flow@localhost",
            ExpiresAt = DateTime.UtcNow.AddMinutes(15)
        };
        db.MagicLinkTokens.Add(token);
        await db.SaveChangesAsync();

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/confirm-magic-link",
            new ConfirmMagicLinkRequest(token.Token));

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponse>>();
        Assert.NotNull(result?.Data);
        Assert.False(string.IsNullOrEmpty(result.Data.Token));
        Assert.Equal("flow@localhost", result.Data.Email);
    }

    [Fact]
    public async Task ConfirmMagicLink_ExpiredToken_Returns400()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<TodoDbContext>();
        var user = new User { Email = "expired@localhost" };
        db.Users.Add(user);
        var token = new MagicLinkToken
        {
            Email = "expired@localhost",
            ExpiresAt = DateTime.UtcNow.AddMinutes(-1) // already expired
        };
        db.MagicLinkTokens.Add(token);
        await db.SaveChangesAsync();

        var response = await _client.PostAsJsonAsync("/api/auth/confirm-magic-link",
            new ConfirmMagicLinkRequest(token.Token));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ConfirmMagicLink_UsedToken_Returns400()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<TodoDbContext>();
        var user = new User { Email = "used@localhost" };
        db.Users.Add(user);
        var token = new MagicLinkToken
        {
            Email = "used@localhost",
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            Used = true
        };
        db.MagicLinkTokens.Add(token);
        await db.SaveChangesAsync();

        var response = await _client.PostAsJsonAsync("/api/auth/confirm-magic-link",
            new ConfirmMagicLinkRequest(token.Token));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task TodoEndpoints_WithoutToken_Returns401()
    {
        var response = await _client.GetAsync("/api/todo");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task HealthEndpoint_WithoutToken_Returns200()
    {
        var response = await _client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
