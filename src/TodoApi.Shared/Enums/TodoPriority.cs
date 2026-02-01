namespace TodoApi.Shared.Enums;

/// <summary>
/// Priority level of a todo item.
/// </summary>
public enum TodoPriority
{
    /// <summary>Low priority — can be deferred.</summary>
    Low = 0,

    /// <summary>Medium priority — normal importance.</summary>
    Medium = 1,

    /// <summary>High priority — should be addressed first.</summary>
    High = 2
}
