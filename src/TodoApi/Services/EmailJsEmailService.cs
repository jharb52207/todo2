using System.Text;
using System.Text.Json;

namespace TodoApi.Services;

public class EmailJsEmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly string _serviceId;
    private readonly string _templateId;
    private readonly string _publicKey;
    private readonly string _privateKey;
    private readonly ILogger<EmailJsEmailService> _logger;

    public EmailJsEmailService(HttpClient httpClient, IConfiguration config, ILogger<EmailJsEmailService> logger)
    {
        _httpClient = httpClient;
        _serviceId = config["EmailJs:ServiceId"] ?? throw new InvalidOperationException("EmailJs:ServiceId is required");
        _templateId = config["EmailJs:TemplateId"] ?? throw new InvalidOperationException("EmailJs:TemplateId is required");
        _publicKey = config["EmailJs:PublicKey"] ?? throw new InvalidOperationException("EmailJs:PublicKey is required");
        _privateKey = config["EmailJs:PrivateKey"] ?? throw new InvalidOperationException("EmailJs:PrivateKey is required");
        _logger = logger;
    }

    public async Task SendMagicLinkAsync(string email, string code)
    {
        var payload = new
        {
            service_id = _serviceId,
            template_id = _templateId,
            user_id = _publicKey,
            accessToken = _privateKey,
            template_params = new
            {
                email,
                passcode = code,
                time = "15 minutes"
            }
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(
            "https://api.emailjs.com/api/v1.0/email/send", content);

        if (response.IsSuccessStatusCode)
        {
            _logger.LogInformation("Login code sent to {Email} via EmailJS", email);
        }
        else
        {
            var body = await response.Content.ReadAsStringAsync();
            _logger.LogError("Failed to send login code to {Email}: {Status} {Body}", email, response.StatusCode, body);
        }
    }
}
