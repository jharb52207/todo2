using TodoApi.Shared.Enums;

namespace TodoApi.Shared.DTOs;

/// <summary>
/// Represents a todo item returned by the API.
/// </summary>
/// <param name="Id">Unique identifier.</param>
/// <param name="Title">Title of the todo item.</param>
/// <param name="Description">Optional longer description.</param>
/// <param name="Status">Current workflow status.</param>
/// <param name="Priority">Priority level.</param>
/// <param name="DueDate">Optional due date in UTC.</param>
/// <param name="Category">Optional category label.</param>
/// <param name="CreatedAt">UTC timestamp when the item was created.</param>
/// <param name="UpdatedAt">UTC timestamp of the last update.</param>
public record TodoItemDto(
    int Id,
    string Title,
    string? Description,
    TodoStatus Status,
    TodoPriority Priority,
    TimeHorizon TimeHorizon,
    DateTime? DueDate,
    string? Category,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
