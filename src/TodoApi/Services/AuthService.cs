using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TodoApi.Data;
using TodoApi.Models;
using TodoApi.Shared.DTOs;

namespace TodoApi.Services;

public class AuthService : IAuthService
{
    private readonly TodoDbContext _db;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(TodoDbContext db, IEmailService emailService, IConfiguration config, ILogger<AuthService> logger)
    {
        _db = db;
        _emailService = emailService;
        _config = config;
        _logger = logger;
    }

    public async Task RequestMagicLinkAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
        if (user is null)
        {
            user = new User { Email = normalizedEmail };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
        }

        var magicToken = new MagicLinkToken
        {
            Email = normalizedEmail,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_config.GetValue<int>("MagicLink:ExpirationMinutes"))
        };

        _db.MagicLinkTokens.Add(magicToken);
        await _db.SaveChangesAsync();

        try
        {
            await _emailService.SendMagicLinkAsync(normalizedEmail, magicToken.Token);
        }
        catch (Exception ex)
        {
            // Log but don't throw — endpoint always returns 200 to prevent email enumeration.
            // In dev without a verified domain, Resend may reject non-owner emails.
            _logger.LogWarning(ex, "Failed to send login code email to {Email}", normalizedEmail);
        }
    }

    public async Task<AuthResponse?> ConfirmMagicLinkAsync(string token)
    {
        var magicToken = await _db.MagicLinkTokens
            .FirstOrDefaultAsync(t => t.Token == token && !t.Used && t.ExpiresAt > DateTime.UtcNow);

        if (magicToken is null)
            return null;

        magicToken.Used = true;
        await _db.SaveChangesAsync();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == magicToken.Email);
        if (user is null)
            return null;

        var jwt = GenerateJwt(user);
        return new AuthResponse(jwt, user.Email);
    }

    private string GenerateJwt(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(_config.GetValue<int>("Jwt:ExpirationHours")),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
