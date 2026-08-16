using System.Linq.Expressions;
using AssignmentSystem.Api.DTOs.Student;
using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Models.Enums;
using AssignmentSystem.Api.Repositories.Interfaces;
using AssignmentSystem.Api.Services.Implementations;
using AssignmentSystem.Tests.Mocks;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Moq;

namespace AssignmentSystem.Tests.Services;

public class StudentServiceTests
{
    private readonly Mock<IGenericRepository<Assignment>> _mockAssignmentRepo;
    private readonly Mock<IGenericRepository<StudentEnrollment>> _mockEnrollmentRepo;
    private readonly Mock<IGenericRepository<Submission>> _mockSubmissionRepo;
    private readonly Mock<IWebHostEnvironment> _mockEnv;
    private readonly StudentService _studentService;

    public StudentServiceTests()
    {
        _mockAssignmentRepo = new Mock<IGenericRepository<Assignment>>();
        _mockEnrollmentRepo = new Mock<IGenericRepository<StudentEnrollment>>();
        _mockSubmissionRepo = new Mock<IGenericRepository<Submission>>();
        _mockEnv = new Mock<IWebHostEnvironment>();

        // Mock the WebRootPath so the service doesn't throw a null reference exception if it checks the path
        _mockEnv.Setup(m => m.WebRootPath).Returns("C:\\Dummy\\Path");

        _studentService = new StudentService(
            _mockAssignmentRepo.Object,
            _mockEnrollmentRepo.Object,
            _mockSubmissionRepo.Object,
            _mockEnv.Object
        );
    }

    // ==========================================
    // SUBMISSION DEADLINE TESTS
    // ==========================================

    [Fact]
    public async Task SubmitAssignmentAsync_BeforeDeadline_SavesAsSubmitted()
    {
        // Arrange
        var studentId = 3;
        var assignment = MockDataFactory.GetTestAssignments().First();
        assignment.Deadline = DateTime.UtcNow.AddDays(1); // Future deadline
        
        var dto = new SubmitAssignmentDto { Content = "On-time submission", Files = new List<IFormFile>() };

        // 1. Mock Assignment found
        _mockAssignmentRepo.Setup(repo => repo.GetByIdAsync(assignment.Id)).ReturnsAsync(assignment);
        
        // 2. Mock Student is enrolled
        _mockEnrollmentRepo.Setup(repo => repo.AnyAsync(It.IsAny<Expression<Func<StudentEnrollment, bool>>>())).ReturnsAsync(true);
        
        // 3. Mock No prior submission exists
        _mockSubmissionRepo.Setup(repo => repo.FirstOrDefaultWithIncludesAsync(
            It.IsAny<Expression<Func<Submission, bool>>>(), 
            It.IsAny<Expression<Func<Submission, object>>[]>())).ReturnsAsync((Submission?)null);

        // Act
        var result = await _studentService.SubmitAssignmentAsync(studentId, assignment.Id, dto);

        // Assert
        result.IsLate.Should().BeFalse();
        
        // Verify it was saved with the normal Submitted status
        _mockSubmissionRepo.Verify(repo => repo.AddAsync(It.Is<Submission>(s => s.Status == SubmissionStatus.Submitted)), Times.Once);
        _mockSubmissionRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task SubmitAssignmentAsync_AfterDeadline_SavesAsLateSubmission()
    {
        // Arrange
        var studentId = 3;
        var assignment = MockDataFactory.GetTestAssignments().First();
        assignment.Deadline = DateTime.UtcNow.AddDays(-1); // Past deadline (LATE)
        
        var dto = new SubmitAssignmentDto { Content = "Sorry I am late", Files = null };

        _mockAssignmentRepo.Setup(repo => repo.GetByIdAsync(assignment.Id)).ReturnsAsync(assignment);
        _mockEnrollmentRepo.Setup(repo => repo.AnyAsync(It.IsAny<Expression<Func<StudentEnrollment, bool>>>())).ReturnsAsync(true);
        _mockSubmissionRepo.Setup(repo => repo.FirstOrDefaultWithIncludesAsync(
            It.IsAny<Expression<Func<Submission, bool>>>(), 
            It.IsAny<Expression<Func<Submission, object>>[]>())).ReturnsAsync((Submission?)null);

        // Act
        var result = await _studentService.SubmitAssignmentAsync(studentId, assignment.Id, dto);

        // Assert
        result.IsLate.Should().BeTrue(); // Should flag as late
        
        // Verify it was saved with the LateSubmission status
        _mockSubmissionRepo.Verify(repo => repo.AddAsync(It.Is<Submission>(s => s.Status == SubmissionStatus.LateSubmission)), Times.Once);
    }

    // ==========================================
    // BUSINESS RULES & VALIDATION TESTS
    // ==========================================

    [Fact]
    public async Task SubmitAssignmentAsync_WhenNotEnrolled_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var studentId = 3;
        var assignment = MockDataFactory.GetTestAssignments().First();
        var dto = new SubmitAssignmentDto { Content = "Hacking the system" };

        _mockAssignmentRepo.Setup(repo => repo.GetByIdAsync(assignment.Id)).ReturnsAsync(assignment);
        
        // Mock enrollment check returning FALSE
        _mockEnrollmentRepo.Setup(repo => repo.AnyAsync(It.IsAny<Expression<Func<StudentEnrollment, bool>>>())).ReturnsAsync(false);

        // Act
        Func<Task> act = async () => await _studentService.SubmitAssignmentAsync(studentId, assignment.Id, dto);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("You are not enrolled in the class/section for this assignment.");
    }

    [Fact]
    public async Task SubmitAssignmentAsync_WhenResubmissionDenied_ThrowsInvalidOperationException()
    {
        // Arrange
        var studentId = 3;
        var assignment = MockDataFactory.GetTestAssignments().First();
        assignment.AllowResubmission = false; // Rule: No resubmissions!
        
        var existingSubmission = MockDataFactory.GetTestSubmissions().First();
        var dto = new SubmitAssignmentDto { Content = "Trying to update my answer" };

        _mockAssignmentRepo.Setup(repo => repo.GetByIdAsync(assignment.Id)).ReturnsAsync(assignment);
        _mockEnrollmentRepo.Setup(repo => repo.AnyAsync(It.IsAny<Expression<Func<StudentEnrollment, bool>>>())).ReturnsAsync(true);
        
        // Mock finding an existing submission
        _mockSubmissionRepo.Setup(repo => repo.FirstOrDefaultWithIncludesAsync(
            It.IsAny<Expression<Func<Submission, bool>>>(), 
            It.IsAny<Expression<Func<Submission, object>>[]>())).ReturnsAsync(existingSubmission);

        // Act
        Func<Task> act = async () => await _studentService.SubmitAssignmentAsync(studentId, assignment.Id, dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("You have already submitted this assignment. Resubmission is not allowed.");
            
        // Verify no updates occurred
        _mockSubmissionRepo.Verify(repo => repo.Update(It.IsAny<Submission>()), Times.Never);
    }
}