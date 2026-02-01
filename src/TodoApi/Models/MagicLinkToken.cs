using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models;

public class MagicLinkToken
{
    public int Id { get; set; }

    [Required]
    public string Token { get; set; } = Random.Shared.Next(100000, 999999).ToString();

    [Required]
    [MaxLength(320)]
    public string Email { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public bool Used { get; set; }
}
