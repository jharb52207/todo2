namespace TodoApi.Shared.Enums;

/// <summary>
/// Workflow status of a todo item.
/// </summary>
public enum TodoStatus
{
    /// <summary>Task has not been started.</summary>
    Pending = 0,

    /// <summary>Task is actively being worked on.</summary>
    InProgress = 1,

    /// <summary>Task has been finished.</summary>
    Completed = 2
}
