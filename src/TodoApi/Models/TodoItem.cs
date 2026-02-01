using System.ComponentModel.DataAnnotations;
using TodoApi.Shared.Enums;

namespace TodoApi.Models;

public class TodoItem
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    public TodoStatus Status { get; set; } = TodoStatus.Pending;

    public TodoPriority Priority { get; set; } = TodoPriority.Medium;

    public TimeHorizon TimeHorizon { get; set; } = TimeHorizon.Today;

    public DateTime? DueDate { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string? UserId { get; set; }
}
