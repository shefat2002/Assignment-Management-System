using AssignmentSystem.Api.Controllers;
using AssignmentSystem.Api.DTOs.Admin;
using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Services.Interfaces;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace AssignmentSystem.Tests.Controllers;

public class AdminControllerTests
{
    private readonly Mock<IAdminService> _mockAdminService;
    private readonly AdminController _controller;

    public AdminControllerTests()
    {
        _mockAdminService = new Mock<IAdminService>();
        _controller = new AdminController(_mockAdminService.Object);
    }

    [Fact]
    public async Task CreateUser_Success_ReturnsOk()
    {
        // Arrange
        var dto = new CreateUserDto { Email = "test@test.com" };
        var user = new User { Id = 1, Email = dto.Email };
        
        _mockAdminService.Setup(s => s.CreateUserAsync(dto)).ReturnsAsync(user);

        // Act
        var result = await _controller.CreateUser(dto);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CreateUser_DuplicateEmail_ReturnsBadRequest()
    {
        // Arrange
        var dto = new CreateUserDto { Email = "duplicate@test.com" };
        
        _mockAdminService.Setup(s => s.CreateUserAsync(dto))
            .ThrowsAsync(new InvalidOperationException("Email is already in use."));

        // Act
        var result = await _controller.CreateUser(dto);

        // Assert
        var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequest.Value.Should().BeEquivalentTo(new { Message = "Email is already in use." });
    }

    [Fact]
    public async Task AssignTeacher_TeacherNotFound_ReturnsNotFound()
    {
        // Arrange
        var dto = new AssignTeacherDto { TeacherId = 99 };
        
        _mockAdminService.Setup(s => s.AssignTeacherAsync(dto))
            .ThrowsAsync(new KeyNotFoundException("Teacher not found."));

        // Act
        var result = await _controller.AssignTeacher(dto);

        // Assert
        var notFound = result.Should().BeOfType<NotFoundObjectResult>().Subject;
        notFound.Value.Should().BeEquivalentTo(new { Message = "Teacher not found." });
    }
}