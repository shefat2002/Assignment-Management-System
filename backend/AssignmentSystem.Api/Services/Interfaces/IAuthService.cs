using AssignmentSystem.Api.DTOs.Auth;

namespace AssignmentSystem.Api.Services.Interfaces;

public interface IAuthService
{
    Task<TokenResponseDto> LoginAsync(LoginDto loginRequest);
}