namespace TodoApi.Services;

public class ConsoleEmailService : IEmailService
{
    private readonly ILogger<ConsoleEmailService> _logger;

    public ConsoleEmailService(ILogger<ConsoleEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendMagicLinkAsync(string email, string code)
    {
        _logger.LogInformation("Login code for {Email}: {Code}", email, code);
        return Task.CompletedTask;
    }
}
