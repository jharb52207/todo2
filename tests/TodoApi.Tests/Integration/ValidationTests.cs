using System.Net;
using System.Net.Http.Json;
using TodoApi.Shared.DTOs;
using TodoApi.Tests.Fixtures;

namespace TodoApi.Tests.Integration;

public class ValidationTests : IClassFixture<TodoApiFactory>
{
    private readonly HttpClient _client;

    public ValidationTests(TodoApiFactory factory)
    {
        _client = factory.CreateAuthenticatedClient();
    }

    [Fact]
    public async Task Create_TitleExactly200Chars_Succeeds()
    {
        var title = new string('a', 200);
        var response = await _client.PostAsJsonAsync("/api/todo", new CreateTodoItemRequest(title, null));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Create_Title201Chars_Returns400()
    {
        var title = new string('a', 201);
        var response = await _client.PostAsJsonAsync("/api/todo", new CreateTodoItemRequest(title, null));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_ValidEnumValues_Succeeds()
    {
        var response = await _client.PostAsJsonAsync("/api/todo",
            new { Title = "Test", Description = (string?)null, Priority = 2 }); // High = 2

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }
}
