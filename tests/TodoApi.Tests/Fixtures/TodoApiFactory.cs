using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using TodoApi.Data;
using TodoApi.Services;

namespace TodoApi.Tests.Fixtures;

public class TodoApiFactory : WebApplicationFactory<Program>
{
    private const string TestJwtSecret = "this-is-a-dev-secret-key-that-must-be-at-least-64-characters-long!!";
    private const string TestJwtIssuer = "TodoApi";
    private const string TestJwtAudience = "TodoApp";

    private readonly string _dbName = $"TestDb_{Guid.NewGuid()}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            var descriptors = services
                .Where(d => d.ServiceType == typeof(DbContextOptions<TodoDbContext>)
                         || d.ServiceType == typeof(TodoDbContext)
                         || d.ServiceType.FullName?.Contains("EntityFrameworkCore") == true)
                .ToList();
            foreach (var d in descriptors) services.Remove(d);

            var dbName = _dbName;
            services.AddDbContext<TodoDbContext>(options =>
                options.UseInMemoryDatabase(dbName));

            // Always use console email service in tests
            var emailDescriptor = services.FirstOrDefault(d => d.ServiceType == typeof(IEmailService));
            if (emailDescriptor is not null) services.Remove(emailDescriptor);
            services.AddSingleton<IEmailService, ConsoleEmailService>();
        });
    }

    public HttpClient CreateAuthenticatedClient(string userId = "test-user-id")
    {
        var client = CreateClient();
        var token = GenerateTestJwt(userId);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    private static string GenerateTestJwt(string userId)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TestJwtSecret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Email, "test@localhost")
        };

        var token = new JwtSecurityToken(
            issuer: TestJwtIssuer,
            audience: TestJwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
