using TodoApi.Shared.DTOs;

namespace TodoApi.Services;

public interface IAuthService
{
    Task RequestMagicLinkAsync(string email);
    Task<AuthResponse?> ConfirmMagicLinkAsync(string token);
}
