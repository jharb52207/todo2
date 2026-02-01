namespace TodoApi.Shared.DTOs;

public record RequestMagicLinkRequest(string Email);

public record ConfirmMagicLinkRequest(string Token);

public record AuthResponse(string Token, string Email);
