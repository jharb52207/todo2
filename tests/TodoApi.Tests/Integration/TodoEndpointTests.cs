using System.Net;
using System.Net.Http.Json;
using TodoApi.Shared.DTOs;
using TodoApi.Shared.Enums;
using TodoApi.Tests.Fixtures;

namespace TodoApi.Tests.Integration;

public class TodoEndpointTests : IClassFixture<TodoApiFactory>
{
    private readonly HttpClient _client;

    public TodoEndpointTests(TodoApiFactory factory)
    {
        _client = factory.CreateAuthenticatedClient();
    }

    #region GET /api/todo

    [Fact]
    public async Task GetAll_ReturnsSuccessResponse()
    {
        var response = await _client.GetAsync("/api/todo");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<TodoItemDto>>>();
        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
    }

    [Fact]
    public async Task GetAll_AfterCreate_ContainsCreatedItem()
    {
        var uniqueTitle = $"GetAll_Test_{Guid.NewGuid()}";
        await _client.PostAsJsonAsync("/api/todo", new CreateTodoItemRequest(uniqueTitle, null));

        var response = await _client.GetAsync("/api/todo");
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<TodoItemDto>>>();

        Assert.NotNull(result?.Data);
        Assert.Contains(result.Data, t => t.Title == uniqueTitle);
    }

    #endregion

    #region GET /api/todo/{id}

    [Fact]
    public async Task GetById_Exists_ReturnsItem()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/todo", new CreateTodoItemRequest("Find Me", "desc"));
        var created = await createResponse.Content.ReadFromJsonAsync<ApiResponse<TodoItemDto>>();

        var response = await _client.GetAsync($"/api/todo/{created!.Data!.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<TodoItemDto>>();
        Assert.Equal("Find Me", result!.Data!.Title);
    }

    [Fact]
    public async Task GetById_NotFound_Returns404()
    {
        var response = await _client.GetAsync("/api/todo/99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    #endregion

    #region POST /api/todo

    [Fact]
    public async Task Create_MinimalRequest_Returns201WithDefaults()
    {
        var response = await _client.PostAsJsonAsync("/api/todo", new CreateTodoItemRequest("Minimal", null));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<TodoItemDto>>();
        Assert.NotNull(result?.Data);
        Assert.Equal("Minimal", result.Data.Title);
        Assert.Equal(TodoStatus.Pending, result.Data.Status);
        Assert.Equal(TodoPriority.Medium, result.Data.Priority);
        Assert.Equal(TimeHorizon.Today, result.Data.TimeHorizon);
    }

    [Fact]
    public async Task Create_FullRequest_ReturnsAllFields()
    {
        var request = new CreateTodoItemRequest("Full Task", "A description", TodoPriority.High, TimeHorizon.Tomorrow, DateTime.UtcNow.AddDays(7), "Work");
        var response = await _client.PostAsJsonAsync("/api/todo", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<TodoItemDto>>();
        Assert.Equal("Full Task", result!.Data!.Title);
        Assert.Equal("A description", result.Data.Description);
        Assert.Equal(TodoPriority.High, result.Data.Priority);
        Assert.Equal(TimeHorizon.Tomorrow, result.Data.TimeHorizon);
        Assert.Equal("Work", result.Data.Category);
    }

    [Fact]
    public async Task Create_WithSomedayHorizon_ReturnsCorrectHorizon()
    {
        var request = new CreateTodoItemRequest("Someday Task", null, TimeHorizon: TimeHorizon.Someday);
        var response = await _client.PostAsJsonAsync("/api/todo", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<TodoItemDto>>();
        Assert.Equal(TimeHorizon.Someday, result!.Data!.TimeHorizon);
    }

    [Fact]
    public async Task Create_EmptyTitle_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/todo", new CreateTodoItemRequest("", null));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_TitleTooLong_Returns400()
    {
        var longTitle = new string('x', 201);
        var response = await _client.PostAsJsonAsync("/api/todo", new CreateTodoItemRequest(longTitle, null));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    #endregion

    #region PUT /api/todo/{id}

    [Fact]
    public async Task Update_PartialUpdate_ReturnsUpdatedItem()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/todo", new CreateTodoItemRequest("Original", "desc"));
        var created = await createResponse.Content.ReadFromJsonAsync<ApiResponse<TodoItemDto>>();

        var updateRequest = new UpdateTodoItemRequest(Status: TodoStatus.Completed);
        var response = await _client.PutAsJsonAsync($"/api/todo/{created!.Data!.Id}", updateRequest);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<TodoItemDto>>();
        Assert.Equal(TodoStatus.Completed, result!.Data!.Status);
        Assert.Equal("Original", result.Data.Title);
    }

    [Fact]
    public async Task Update_TimeHorizon_ReturnsUpdatedHorizon()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/todo", new CreateTodoItemRequest("Horizon Test", null));
        var created = await createResponse.Content.ReadFromJsonAsync<ApiResponse<TodoItemDto>>();

        var updateRequest = new UpdateTodoItemRequest(TimeHorizon: TimeHorizon.Someday);
        var response = await _client.PutAsJsonAsync($"/api/todo/{created!.Data!.Id}", updateRequest);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<TodoItemDto>>();
        Assert.Equal(TimeHorizon.Someday, result!.Data!.TimeHorizon);
        Assert.Equal("Horizon Test", result.Data.Title); // unchanged
    }

    [Fact]
    public async Task Update_NotFound_Returns404()
    {
        var response = await _client.PutAsJsonAsync("/api/todo/99999", new UpdateTodoItemRequest(Title: "X"));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Update_TitleTooLong_Returns400()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/todo", new CreateTodoItemRequest("Test", null));
        var created = await createResponse.Content.ReadFromJsonAsync<ApiResponse<TodoItemDto>>();

        var longTitle = new string('x', 201);
        var response = await _client.PutAsJsonAsync($"/api/todo/{created!.Data!.Id}", new UpdateTodoItemRequest(Title: longTitle));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    #endregion

    #region POST /api/todo/bulk

    [Fact]
    public async Task BulkCreate_MultipleItems_ReturnsAllCreated()
    {
        var items = new[]
        {
            new CreateTodoItemRequest("Bulk A", null),
            new CreateTodoItemRequest("Bulk B", "with desc")
        };

        var response = await _client.PostAsJsonAsync("/api/todo/bulk", items);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<TodoItemDto>>>();
        Assert.NotNull(result?.Data);
        Assert.Equal(2, result.Data.Count);
    }

    [Fact]
    public async Task BulkCreate_EmptyArray_ReturnsEmpty()
    {
        var response = await _client.PostAsJsonAsync("/api/todo/bulk", Array.Empty<CreateTodoItemRequest>());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<TodoItemDto>>>();
        Assert.NotNull(result?.Data);
        Assert.Empty(result.Data);
    }

    #endregion

    #region Cross-user isolation

    [Fact]
    public async Task GetById_OtherUsersTodo_Returns404()
    {
        // Create a todo with user A
        var createResponse = await _client.PostAsJsonAsync("/api/todo", new CreateTodoItemRequest("User A's Todo", null));
        var created = await createResponse.Content.ReadFromJsonAsync<ApiResponse<TodoItemDto>>();

        // Try to access with user B
        var factory = new TodoApiFactory();
        var clientB = factory.CreateAuthenticatedClient("different-user-id");
        var response = await clientB.GetAsync($"/api/todo/{created!.Data!.Id}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    #endregion

    #region DELETE /api/todo/{id}

    [Fact]
    public async Task Delete_Exists_Returns200()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/todo", new CreateTodoItemRequest("Delete Me", null));
        var created = await createResponse.Content.ReadFromJsonAsync<ApiResponse<TodoItemDto>>();

        var response = await _client.DeleteAsync($"/api/todo/{created!.Data!.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Delete_NotFound_Returns404()
    {
        var response = await _client.DeleteAsync("/api/todo/99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    #endregion
}
