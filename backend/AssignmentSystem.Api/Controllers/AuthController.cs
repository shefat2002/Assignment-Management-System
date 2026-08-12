using AssignmentSystem.Api.DTOs.Auth;
using AssignmentSystem.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentSystem.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController:ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginRequest)
    {
        try
        {
            var response = await _authService.LoginAsync(loginRequest);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return StatusCode(500, new { Message = ex.Message }); }
        catch (Exception) { return StatusCode(500, new { Message = "An error occurred during login." }); }
    }

}