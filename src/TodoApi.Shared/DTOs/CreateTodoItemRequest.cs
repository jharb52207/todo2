using TodoApi.Shared.Enums;

namespace TodoApi.Shared.DTOs;

/// <summary>
/// Request body for creating a new todo item.
/// </summary>
/// <param name="Title">The title of the todo item. Required; max 200 characters.</param>
/// <param name="Description">An optional longer description of the task.</param>
/// <param name="Priority">Priority level. Defaults to <see cref="TodoPriority.Medium"/>.</param>
/// <param name="DueDate">Optional due date in UTC.</param>
/// <param name="Category">Optional category label for grouping.</param>
public record CreateTodoItemRequest(
    string Title,
    string? Description,
    TodoPriority Priority = TodoPriority.Medium,
    TimeHorizon TimeHorizon = TimeHorizon.Today,
    DateTime? DueDate = null,
    string? Category = null
);
