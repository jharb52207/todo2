using TodoApi.Shared.Enums;

namespace TodoApi.Shared.DTOs;

/// <summary>
/// Request body for updating an existing todo item.
/// Uses partial-update semantics: only non-null fields are applied. Omit a field or set it to null to leave it unchanged.
/// </summary>
/// <param name="Title">New title. Max 200 characters. Null to leave unchanged.</param>
/// <param name="Description">New description. Null to leave unchanged.</param>
/// <param name="Status">New status. Null to leave unchanged.</param>
/// <param name="Priority">New priority. Null to leave unchanged.</param>
/// <param name="DueDate">New due date in UTC. Null to leave unchanged.</param>
/// <param name="Category">New category label. Null to leave unchanged.</param>
public record UpdateTodoItemRequest(
    string? Title = null,
    string? Description = null,
    TodoStatus? Status = null,
    TodoPriority? Priority = null,
    TimeHorizon? TimeHorizon = null,
    DateTime? DueDate = null,
    string? Category = null
);
