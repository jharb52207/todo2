using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;
using TodoApi.Services;
using TodoApi.Shared.DTOs;
using TodoApi.Shared.Enums;

namespace TodoApi.UnitTests.Services;

public class TodoServiceTests : IDisposable
{
    private readonly TodoDbContext _db;
    private readonly TodoService _service;

    public TodoServiceTests()
    {
        var options = new DbContextOptionsBuilder<TodoDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new TodoDbContext(options);
        _service = new TodoService(_db);
    }

    public void Dispose() => _db.Dispose();

    #region GetAllAsync

    [Fact]
    public async Task GetAllAsync_EmptyDb_ReturnsEmpty()
    {
        var result = await _service.GetAllAsync("user1");

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetAllAsync_FiltersByUserId()
    {
        _db.TodoItems.AddRange(
            new TodoItem { Title = "User1 Task", UserId = "user1" },
            new TodoItem { Title = "User2 Task", UserId = "user2" }
        );
        await _db.SaveChangesAsync();

        var result = (await _service.GetAllAsync("user1")).ToList();

        Assert.Single(result);
        Assert.Equal("User1 Task", result[0].Title);
    }

    [Fact]
    public async Task GetAllAsync_OrdersByCreatedAtDescending()
    {
        _db.TodoItems.AddRange(
            new TodoItem { Title = "Older", UserId = "u1", CreatedAt = DateTime.UtcNow.AddHours(-2) },
            new TodoItem { Title = "Newer", UserId = "u1", CreatedAt = DateTime.UtcNow }
        );
        await _db.SaveChangesAsync();

        var result = (await _service.GetAllAsync("u1")).ToList();

        Assert.Equal("Newer", result[0].Title);
        Assert.Equal("Older", result[1].Title);
    }

    #endregion

    #region GetByIdAsync

    [Fact]
    public async Task GetByIdAsync_Found_ReturnsDto()
    {
        var item = new TodoItem { Title = "Test", UserId = "u1" };
        _db.TodoItems.Add(item);
        await _db.SaveChangesAsync();

        var result = await _service.GetByIdAsync(item.Id, "u1");

        Assert.NotNull(result);
        Assert.Equal("Test", result.Title);
    }

    [Fact]
    public async Task GetByIdAsync_NotFound_ReturnsNull()
    {
        var result = await _service.GetByIdAsync(999, "u1");

        Assert.Null(result);
    }

    [Fact]
    public async Task GetByIdAsync_WrongUser_ReturnsNull()
    {
        var item = new TodoItem { Title = "Test", UserId = "u1" };
        _db.TodoItems.Add(item);
        await _db.SaveChangesAsync();

        var result = await _service.GetByIdAsync(item.Id, "u2");

        Assert.Null(result);
    }

    #endregion

    #region CreateAsync

    [Fact]
    public async Task CreateAsync_AllFields_ReturnsPopulatedDto()
    {
        var request = new CreateTodoItemRequest(
            "New Task",
            "Description",
            TodoPriority.High,
            TimeHorizon.Tomorrow,
            new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc),
            "Work"
        );

        var result = await _service.CreateAsync(request, "u1");

        Assert.Equal("New Task", result.Title);
        Assert.Equal("Description", result.Description);
        Assert.Equal(TodoPriority.High, result.Priority);
        Assert.Equal("Work", result.Category);
    }

    [Fact]
    public async Task CreateAsync_Defaults_PendingStatusAndTimestamps()
    {
        var before = DateTime.UtcNow;
        var request = new CreateTodoItemRequest("Minimal Task", null);

        var result = await _service.CreateAsync(request, "u1");

        Assert.Equal(TodoStatus.Pending, result.Status);
        Assert.Equal(TodoPriority.Medium, result.Priority);
        Assert.Equal(TimeHorizon.Today, result.TimeHorizon);
        Assert.True(result.CreatedAt >= before);
        Assert.True(result.UpdatedAt >= before);
    }

    [Fact]
    public async Task CreateAsync_WithTimeHorizon_ReturnsSpecifiedHorizon()
    {
        var request = new CreateTodoItemRequest("Tomorrow Task", null, TimeHorizon: TimeHorizon.Tomorrow);

        var result = await _service.CreateAsync(request, "u1");

        Assert.Equal(TimeHorizon.Tomorrow, result.TimeHorizon);
    }

    [Fact]
    public async Task CreateAsync_WithSomeday_ReturnsSpecifiedHorizon()
    {
        var request = new CreateTodoItemRequest("Someday Task", null, TimeHorizon: TimeHorizon.Someday);

        var result = await _service.CreateAsync(request, "u1");

        Assert.Equal(TimeHorizon.Someday, result.TimeHorizon);
    }

    #endregion

    #region UpdateAsync

    [Fact]
    public async Task UpdateAsync_PartialUpdate_OnlyChangesSpecifiedFields()
    {
        var item = new TodoItem { Title = "Original", Description = "Desc", UserId = "u1" };
        _db.TodoItems.Add(item);
        await _db.SaveChangesAsync();

        var request = new UpdateTodoItemRequest(Title: "Updated");
        var result = await _service.UpdateAsync(item.Id, request, "u1");

        Assert.NotNull(result);
        Assert.Equal("Updated", result.Title);
        Assert.Equal("Desc", result.Description); // unchanged
    }

    [Fact]
    public async Task UpdateAsync_FullUpdate_ChangesAllFields()
    {
        var item = new TodoItem { Title = "Original", UserId = "u1" };
        _db.TodoItems.Add(item);
        await _db.SaveChangesAsync();

        var request = new UpdateTodoItemRequest(
            Title: "New Title",
            Description: "New Desc",
            Status: TodoStatus.Completed,
            Priority: TodoPriority.High,
            TimeHorizon: TimeHorizon.Someday,
            DueDate: new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc),
            Category: "Personal"
        );
        var result = await _service.UpdateAsync(item.Id, request, "u1");

        Assert.NotNull(result);
        Assert.Equal("New Title", result.Title);
        Assert.Equal(TodoStatus.Completed, result.Status);
        Assert.Equal(TodoPriority.High, result.Priority);
        Assert.Equal(TimeHorizon.Someday, result.TimeHorizon);
    }

    [Fact]
    public async Task UpdateAsync_TimeHorizonOnly_ChangesOnlyHorizon()
    {
        var item = new TodoItem { Title = "Keep Me", UserId = "u1", TimeHorizon = TimeHorizon.Today };
        _db.TodoItems.Add(item);
        await _db.SaveChangesAsync();

        var request = new UpdateTodoItemRequest(TimeHorizon: TimeHorizon.Tomorrow);
        var result = await _service.UpdateAsync(item.Id, request, "u1");

        Assert.NotNull(result);
        Assert.Equal("Keep Me", result.Title);
        Assert.Equal(TimeHorizon.Tomorrow, result.TimeHorizon);
    }

    [Fact]
    public async Task UpdateAsync_NotFound_ReturnsNull()
    {
        var request = new UpdateTodoItemRequest(Title: "X");
        var result = await _service.UpdateAsync(999, request, "u1");

        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateAsync_WrongUser_ReturnsNull()
    {
        var item = new TodoItem { Title = "Test", UserId = "u1" };
        _db.TodoItems.Add(item);
        await _db.SaveChangesAsync();

        var request = new UpdateTodoItemRequest(Title: "Hacked");
        var result = await _service.UpdateAsync(item.Id, request, "u2");

        Assert.Null(result);
    }

    #endregion

    #region DeleteAsync

    [Fact]
    public async Task DeleteAsync_Success_ReturnsTrue()
    {
        var item = new TodoItem { Title = "Test", UserId = "u1" };
        _db.TodoItems.Add(item);
        await _db.SaveChangesAsync();

        var result = await _service.DeleteAsync(item.Id, "u1");

        Assert.True(result);
        Assert.Empty(_db.TodoItems);
    }

    [Fact]
    public async Task DeleteAsync_NotFound_ReturnsFalse()
    {
        var result = await _service.DeleteAsync(999, "u1");

        Assert.False(result);
    }

    [Fact]
    public async Task DeleteAsync_WrongUser_ReturnsFalse()
    {
        var item = new TodoItem { Title = "Test", UserId = "u1" };
        _db.TodoItems.Add(item);
        await _db.SaveChangesAsync();

        var result = await _service.DeleteAsync(item.Id, "u2");

        Assert.False(result);
    }

    #endregion

    #region BulkCreateAsync

    [Fact]
    public async Task BulkCreateAsync_CreatesAllItems()
    {
        var requests = new[]
        {
            new CreateTodoItemRequest("Task 1", null),
            new CreateTodoItemRequest("Task 2", "Description"),
            new CreateTodoItemRequest("Task 3", null, TodoPriority.High)
        };

        var result = (await _service.BulkCreateAsync(requests, "u1")).ToList();

        Assert.Equal(3, result.Count);
        Assert.Equal("Task 1", result[0].Title);
        Assert.Equal("Task 2", result[1].Title);
        Assert.Equal(TodoPriority.High, result[2].Priority);
        Assert.Equal(3, _db.TodoItems.Count());
    }

    [Fact]
    public async Task BulkCreateAsync_PreservesTimeHorizon()
    {
        var requests = new[]
        {
            new CreateTodoItemRequest("Today", null, TimeHorizon: TimeHorizon.Today),
            new CreateTodoItemRequest("Tomorrow", null, TimeHorizon: TimeHorizon.Tomorrow),
            new CreateTodoItemRequest("Someday", null, TimeHorizon: TimeHorizon.Someday)
        };

        var result = (await _service.BulkCreateAsync(requests, "u1")).ToList();

        Assert.Equal(TimeHorizon.Today, result[0].TimeHorizon);
        Assert.Equal(TimeHorizon.Tomorrow, result[1].TimeHorizon);
        Assert.Equal(TimeHorizon.Someday, result[2].TimeHorizon);
    }

    [Fact]
    public async Task BulkCreateAsync_EmptyArray_ReturnsEmpty()
    {
        var result = await _service.BulkCreateAsync([], "u1");

        Assert.Empty(result);
    }

    [Fact]
    public async Task BulkCreateAsync_AssignsUserId()
    {
        var requests = new[] { new CreateTodoItemRequest("Task", null) };

        await _service.BulkCreateAsync(requests, "u1");

        Assert.Equal("u1", _db.TodoItems.Single().UserId);
    }

    #endregion
}
