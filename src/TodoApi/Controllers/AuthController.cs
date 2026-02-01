using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApi.Services;
using TodoApi.Shared.DTOs;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Request a magic link for passwordless login.
    /// </summary>
    [HttpPost("request-magic-link")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> RequestMagicLink([FromBody] RequestMagicLinkRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(ApiResponse.Fail("Email is required."));

        await _authService.RequestMagicLinkAsync(request.Email);
        return Ok(ApiResponse.Ok("If that email is registered, a magic link has been sent."));
    }

    /// <summary>
    /// Confirm a magic link token and receive a JWT.
    /// </summary>
    [HttpPost("confirm-magic-link")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ConfirmMagicLink([FromBody] ConfirmMagicLinkRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Token))
            return BadRequest(ApiResponse.Fail("Token is required."));

        var result = await _authService.ConfirmMagicLinkAsync(request.Token);
        if (result is null)
            return BadRequest(ApiResponse.Fail("Invalid or expired token."));

        return Ok(ApiResponse<AuthResponse>.Ok(result));
    }
}
