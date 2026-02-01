using TodoApi.Shared.DTOs;

namespace TodoApi.Services;

public interface ITodoService
{
    Task<IEnumerable<TodoItemDto>> GetAllAsync(string? userId);
    Task<TodoItemDto?> GetByIdAsync(int id, string? userId);
    Task<TodoItemDto> CreateAsync(CreateTodoItemRequest request, string? userId);
    Task<TodoItemDto?> UpdateAsync(int id, UpdateTodoItemRequest request, string? userId);
    Task<bool> DeleteAsync(int id, string? userId);
    Task<IEnumerable<TodoItemDto>> BulkCreateAsync(CreateTodoItemRequest[] requests, string? userId);
}
