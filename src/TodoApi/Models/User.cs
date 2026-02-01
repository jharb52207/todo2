using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models;

public class User
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(320)]
    public string Email { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
