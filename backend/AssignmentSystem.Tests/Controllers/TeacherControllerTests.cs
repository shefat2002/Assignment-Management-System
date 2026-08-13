using System.Security.Claims;
using AssignmentSystem.Api.Controllers;
using AssignmentSystem.Api.DTOs.Teacher;
using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Services.Interfaces;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace AssignmentSystem.Tests.Controllers;

public class TeacherControllerTests
{
    private readonly Mock<ITeacherService> _mockTeacherService;
    private readonly TeacherController _controller;

    public TeacherControllerTests()
    {
        _mockTeacherService = new Mock<ITeacherService>();
        _controller = new TeacherController(_mockTeacherService.Object);

        // Mock the JWT User Context
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, "2") // Mocking teacher ID = 2
        }, "mock"));

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };
    }

    [Fact]
    public async Task CreateAssignment_Success_ReturnsCreatedAtAction()
    {
        // Arrange
        var dto = new CreateAssignmentDto { Title = "Test Assignment" };
        var createdAssignment = new Assignment { Id = 1, Title = "Test Assignment" };

        _mockTeacherService.Setup(s => s.CreateAssignmentAsync(2, dto)).ReturnsAsync(createdAssignment);

        // Act
        var result = await _controller.CreateAssignment(dto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be("GetAssignment");
        createdResult.RouteValues?["id"].Should().Be(1);
    }

    [Fact]
    public async Task CreateAssignment_UnauthorizedClass_ReturnsForbidden()
    {
        // Arrange
        var dto = new CreateAssignmentDto { Title = "Unauthorized" };

        _mockTeacherService.Setup(s => s.CreateAssignmentAsync(2, dto))
            .ThrowsAsync(new UnauthorizedAccessException("Not authorized."));

        // Act
        var result = await _controller.CreateAssignment(dto);

        // Assert
        var forbiddenResult = result.Should().BeOfType<ObjectResult>().Subject;
        forbiddenResult.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
    }
}