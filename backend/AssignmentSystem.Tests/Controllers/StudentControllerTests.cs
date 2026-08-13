using System.Security.Claims;
using AssignmentSystem.Api.Controllers;
using AssignmentSystem.Api.DTOs.Student;
using AssignmentSystem.Api.Services.Interfaces;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace AssignmentSystem.Tests.Controllers;

public class StudentControllerTests
{
    private readonly Mock<IStudentService> _mockStudentService;
    private readonly StudentController _controller;

    public StudentControllerTests()
    {
        _mockStudentService = new Mock<IStudentService>();
        _controller = new StudentController(_mockStudentService.Object);

        // Mock the JWT User Context for Student ID = 3
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, "3") 
        }, "mock"));

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };
    }

    [Fact]
    public async Task SubmitAssignment_Success_ReturnsOk()
    {
        // Arrange
        var assignmentId = 1;
        var dto = new SubmitAssignmentDto { Content = "My Homework" };
        var serviceResult = (IsLate: false, Message: "Assignment submitted successfully.");

        _mockStudentService.Setup(s => s.SubmitAssignmentAsync(3, assignmentId, dto))
            .ReturnsAsync(serviceResult);

        // Act
        var result = await _controller.SubmitAssignment(assignmentId, dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeEquivalentTo(new { Message = serviceResult.Message, IsLate = serviceResult.IsLate });
    }

    [Fact]
    public async Task SubmitAssignment_NotEnrolled_ReturnsForbidden()
    {
        // Arrange
        var assignmentId = 1;
        var dto = new SubmitAssignmentDto();

        _mockStudentService.Setup(s => s.SubmitAssignmentAsync(3, assignmentId, dto))
            .ThrowsAsync(new UnauthorizedAccessException("Not enrolled."));

        // Act
        var result = await _controller.SubmitAssignment(assignmentId, dto);

        // Assert
        var forbiddenResult = result.Should().BeOfType<ObjectResult>().Subject;
        forbiddenResult.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
    }
}