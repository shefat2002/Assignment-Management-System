using AssignmentSystem.Api.DTOs.Auth;
using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Repositories.Interfaces;
using AssignmentSystem.Api.Services.Interfaces;

namespace AssignmentSystem.Api.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IGenericRepository<User> _userRepository;
    private readonly IConfiguration _configuration;

    public AuthService(IGenericRepository<User> userRepository, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _configuration = configuration;
    }

    public Task<TokenResponseDto> LoginAsync(LoginDto loginRequest)
    {
        throw new NotImplementedException();
    }
}