using AssignmentSystem.Api.Controllers;
using AssignmentSystem.Api.DTOs.Auth;
using AssignmentSystem.Api.Services.Interfaces;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace AssignmentSystem.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _mockAuthService;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _mockAuthService = new Mock<IAuthService>();
        _controller = new AuthController(_mockAuthService.Object);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOk()
    {
        // Arrange
        var dto = new LoginDto { Email = "test@test.com", Password = "password" };
        var tokenResponse = new TokenResponseDto { Token = "mock_token", UserId = 1, Role = "Student" };
        
        _mockAuthService.Setup(s => s.LoginAsync(dto)).ReturnsAsync(tokenResponse);

        // Act
        var result = await _controller.Login(dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeEquivalentTo(tokenResponse);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var dto = new LoginDto { Email = "wrong@test.com", Password = "password" };
        
        _mockAuthService.Setup(s => s.LoginAsync(dto))
            .ThrowsAsync(new UnauthorizedAccessException("Invalid email or password."));

        // Act
        var result = await _controller.Login(dto);

        // Assert
        var unauthorizedResult = result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
        // Verify the response contains the right message property
        unauthorizedResult.Value.Should().BeEquivalentTo(new { Message = "Invalid email or password." });
    }
}