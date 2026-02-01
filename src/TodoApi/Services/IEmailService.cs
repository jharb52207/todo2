namespace TodoApi.Services;

public interface IEmailService
{
    Task SendMagicLinkAsync(string email, string code);
}
