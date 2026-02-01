using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;
using TodoApi.Shared.DTOs;
using TodoApi.Shared.Enums;

namespace TodoApi.Services;

public class TodoService : ITodoService
{
    private readonly TodoDbContext _db;

    public TodoService(TodoDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<TodoItemDto>> GetAllAsync(string? userId)
    {
        return await _db.TodoItems
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => MapToDto(t))
            .ToListAsync();
    }

    public async Task<TodoItemDto?> GetByIdAsync(int id, string? userId)
    {
        var item = await _db.TodoItems
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        return item is null ? null : MapToDto(item);
    }

    public async Task<TodoItemDto> CreateAsync(CreateTodoItemRequest request, string? userId)
    {
        var item = new TodoItem
        {
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            TimeHorizon = request.TimeHorizon,
            DueDate = request.DueDate,
            Category = request.Category,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.TodoItems.Add(item);
        await _db.SaveChangesAsync();
        return MapToDto(item);
    }

    public async Task<TodoItemDto?> UpdateAsync(int id, UpdateTodoItemRequest request, string? userId)
    {
        var item = await _db.TodoItems
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (item is null) return null;

        if (request.Title is not null) item.Title = request.Title;
        if (request.Description is not null) item.Description = request.Description;
        if (request.Status.HasValue) item.Status = request.Status.Value;
        if (request.Priority.HasValue) item.Priority = request.Priority.Value;
        if (request.TimeHorizon.HasValue) item.TimeHorizon = request.TimeHorizon.Value;
        if (request.DueDate.HasValue) item.DueDate = request.DueDate.Value;
        if (request.Category is not null) item.Category = request.Category;

        item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return MapToDto(item);
    }

    public async Task<bool> DeleteAsync(int id, string? userId)
    {
        var item = await _db.TodoItems
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (item is null) return false;

        _db.TodoItems.Remove(item);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<TodoItemDto>> BulkCreateAsync(CreateTodoItemRequest[] requests, string? userId)
    {
        var items = requests.Select(r => new TodoItem
        {
            Title = r.Title,
            Description = r.Description,
            Priority = r.Priority,
            TimeHorizon = r.TimeHorizon,
            DueDate = r.DueDate,
            Category = r.Category,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        }).ToList();

        _db.TodoItems.AddRange(items);
        await _db.SaveChangesAsync();
        return items.Select(MapToDto);
    }

    private static TodoItemDto MapToDto(TodoItem item) => new(
        item.Id,
        item.Title,
        item.Description,
        item.Status,
        item.Priority,
        item.TimeHorizon,
        item.DueDate,
        item.Category,
        item.CreatedAt,
        item.UpdatedAt
    );
}
