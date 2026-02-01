using System.Net;
using System.Net.Http.Json;
using TodoApi.Shared.DTOs;
using TodoApi.Tests.Fixtures;

namespace TodoApi.Tests.Integration;

public class ErrorHandlingTests : IClassFixture<TodoApiFactory>
{
    private readonly HttpClient _client;

    public ErrorHandlingTests(TodoApiFactory factory)
    {
        _client = factory.CreateAuthenticatedClient();
    }

    [Fact]
    public async Task InvalidRoute_Returns404()
    {
        var response = await _client.GetAsync("/api/nonexistent");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task InvalidJsonBody_Returns400()
    {
        var content = new StringContent("{invalid json}", System.Text.Encoding.UTF8, "application/json");
        var response = await _client.PostAsync("/api/todo", content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
