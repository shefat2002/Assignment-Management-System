using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AssignmentSystem.Api.Data;
using AssignmentSystem.Api.DTOs.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace AssignmentSystem.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
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
            if (string.IsNullOrWhiteSpace(loginRequest?.Email))
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

            var jwtSecret = Environment.GetEnvironmentVariable("Jwt__Key")
                ?? _configuration["JwtSetting:SecretKey"];

            if (string.IsNullOrEmpty(jwtSecret))
            {
                return StatusCode(500, new { Message = "Server configuration error." });
            }

            var issuer = _configuration["JwtSetting:Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured.");
            var audience = _configuration["JwtSetting:Audience"] ?? throw new InvalidOperationException("JWT Audience not configured.");

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

            return Ok(new
            {
                Token = tokenString,
                UserId = user.Id,
                Role = user.Role.ToString()
            });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(500, new { Message = "Server configuration error." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred during login." });
        }
    }

}