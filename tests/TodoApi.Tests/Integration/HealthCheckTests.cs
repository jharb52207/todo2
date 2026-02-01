using System.Net;
using System.Net.Http.Json;
using TodoApi.Shared.DTOs;
using TodoApi.Tests.Fixtures;

namespace TodoApi.Tests.Integration;

public class HealthCheckTests : IClassFixture<TodoApiFactory>
{
    private readonly HttpClient _client;

    public HealthCheckTests(TodoApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task HealthEndpoint_ReturnsHealthy()
    {
        var response = await _client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<Dictionary<string, object>>>();
        Assert.NotNull(result);
        Assert.True(result.Success);
    }
}
