using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AssignmentSystem.Api.Data;
using AssignmentSystem.Api.DTOs.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace AssignmentSystem.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AuthController:ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginRequest)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(loginRequest.Email))
            {
                return BadRequest(new { Message = "Email is required." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginRequest.Email);
            if (user == null)
            {
                return Unauthorized(new { Message = "Invalid email or password." });
            }

            
            if (!BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.PasswordHash))
            {
                return Unauthorized(new { Message = "Invalid email or password." });
            }

            var tokenHandler = new JwtSecurityTokenHandler();

            var jwtSecret = Environment.GetEnvironmentVariable("JWT_KEY")
                ?? _configuration["JWT_KEY"];

            var issuer = Environment.GetEnvironmentVariable("JWT_ISSUER")
                ?? _configuration["JWT_ISSUER"];

            var audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")
                ?? _configuration["JWT_AUDIENCE"];

            if (string.IsNullOrEmpty(jwtSecret) || string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience))
            {
                return StatusCode(500, new { Message = "Server configuration error." });
            }

            var key = Encoding.ASCII.GetBytes(jwtSecret);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Email),
                    new Claim(ClaimTypes.Role, user.Role.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            var response = new TokenResponseDto()
            {
                Token = tokenString,
                UserId = user.Id,
                Role = user.Role.ToString(),
                Expires = tokenDescriptor.Expires ?? DateTime.UtcNow.AddDays(7)
            };

            return Ok(response);
        }
        catch (InvalidOperationException)
        {
            return StatusCode(500, new { Message = "Server configuration error." });
        }
        catch (Exception)
        {
            return StatusCode(500, new { Message = "An error occurred during login." });
        }
    }

}