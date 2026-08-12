using System.Linq.Expressions;
using AssignmentSystem.Api.DTOs.Auth;
using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Models.Enums;
using AssignmentSystem.Api.Models.Settings;
using AssignmentSystem.Api.Repositories.Interfaces;
using AssignmentSystem.Api.Services.Implementations;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;

namespace AssignmentSystem.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IGenericRepository<User>> _mockUserRepo;
    private readonly Mock<IConfiguration> _mockConfig;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _mockUserRepo = new Mock<IGenericRepository<User>>();
        _mockConfig = new Mock<IConfiguration>();

        var jwtSettings = new JwtSettings
        {
            Key = "SuperSecretKeyThatIsLongEnoughForHmacSha256!!!!!",
            Issuer = "TestIssuer",
            Audience = "TestAudience"
        };

        _authService = new AuthService(_mockUserRepo.Object, _mockConfig.Object, jwtSettings);
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsTokenResponse()
    {
        // Arrange
        var password = "SecurePassword123!";
        var user = new User
        {
            Id = 1,
            Email = "test@student.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = UserRole.Student
        };

        var loginDto = new LoginDto
        {
            Email = "test@student.com",
            Password = password
        };

        _mockUserRepo
            .Setup(repo => repo.FirstOrDefaultAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(user);

        // Act
        var result = await _authService.LoginAsync(loginDto);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().NotBeNullOrEmpty();
        result.UserId.Should().Be(1);
        result.Role.Should().Be("Student");
    }

    [Fact]
    public async Task LoginAsync_WithInvalidEmail_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var loginDto = new LoginDto { Email = "wrong@test.com", Password = "password" };

        _mockUserRepo
            .Setup(repo => repo.FirstOrDefaultAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync((User?)null);

        // Act
        Func<Task> act = async () => await _authService.LoginAsync(loginDto);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid email or password.");
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = "test@student.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword")
        };

        var loginDto = new LoginDto
        {
            Email = "test@student.com",
            Password = "WrongPassword"
        };

        _mockUserRepo
            .Setup(repo => repo.FirstOrDefaultAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(user);

        // Act
        Func<Task> act = async () => await _authService.LoginAsync(loginDto);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid email or password.");
    }

}
