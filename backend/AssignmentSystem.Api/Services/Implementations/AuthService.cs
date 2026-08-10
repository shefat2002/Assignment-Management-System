using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AssignmentSystem.Api.DTOs.Auth;
using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Models.Settings;
using AssignmentSystem.Api.Repositories.Interfaces;
using AssignmentSystem.Api.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;

namespace AssignmentSystem.Api.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IGenericRepository<User> _userRepository;
    private readonly JwtSettings _jwtSettings;

    public AuthService(IGenericRepository<User> userRepository, IConfiguration configuration, JwtSettings jwtSettings)
    {
        _userRepository = userRepository;
        _jwtSettings = jwtSettings;
    }

    public async Task<TokenResponseDto> LoginAsync(LoginDto loginRequest)
    {
        var user = await _userRepository.FirstOrDefaultAsync(u => u.Email == loginRequest.Email);
        if(user == null || !BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }
        if(string.IsNullOrEmpty(_jwtSettings.Key) || string.IsNullOrEmpty(_jwtSettings.Issuer) || string.IsNullOrEmpty(_jwtSettings.Audience))
        {
            throw new InvalidOperationException("Server configuration error.");
        }
        
        var key = Encoding.ASCII.GetBytes(_jwtSettings.Key);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = _jwtSettings.Issuer,
            Audience = _jwtSettings.Audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return new TokenResponseDto
        {
            Token = tokenHandler.WriteToken(token),
            UserId = user.Id,
            Role = user.Role.ToString(),
            Expires = tokenDescriptor.Expires ?? DateTime.UtcNow.AddDays(7)
        };

    }
}