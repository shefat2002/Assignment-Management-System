using System.Linq.Expressions;
using AssignmentSystem.Api.DTOs.Teacher;
using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Models.Enums;
using AssignmentSystem.Api.Repositories.Interfaces;
using AssignmentSystem.Api.Services.Implementations;
using AssignmentSystem.Tests.Mocks;
using FluentAssertions;
using Moq;

namespace AssignmentSystem.Tests.Services;

public class TeacherServiceTests
{
    private readonly Mock<IGenericRepository<Assignment>> _mockAssignmentRepo;
    private readonly Mock<IGenericRepository<TeacherAssignment>> _mockTeacherAssignmentRepo;
    private readonly Mock<IGenericRepository<Submission>> _mockSubmissionRepo;
    private readonly Mock<IGenericRepository<StudentEnrollment>> _mockEnrollmentRepo;
    private readonly TeacherService _teacherService;

    public TeacherServiceTests()
    {
        _mockAssignmentRepo = new Mock<IGenericRepository<Assignment>>();
        _mockTeacherAssignmentRepo = new Mock<IGenericRepository<TeacherAssignment>>();
        _mockSubmissionRepo = new Mock<IGenericRepository<Submission>>();
        _mockEnrollmentRepo = new Mock<IGenericRepository<StudentEnrollment>>();

        _teacherService = new TeacherService(
            _mockAssignmentRepo.Object,
            _mockTeacherAssignmentRepo.Object,
            _mockSubmissionRepo.Object,
            _mockEnrollmentRepo.Object
        );
    }

    // ==========================================
    // CREATE ASSIGNMENT TESTS
    // ==========================================

    [Fact]
    public async Task CreateAssignmentAsync_WhenAuthorized_CreatesSuccessfully()
    {
        // Arrange
        var teacherId = 2; // From our MockDataFactory
        var dto = new CreateAssignmentDto
        {
            Title = "New Homework",
            Description = "Do the exercises.",
            DueDate = DateTime.UtcNow.AddDays(3),
            TotalMarks = 50,
            AllowResubmission = false,
            ClassId = 1,
            SubjectId = 1
        };

        // Simulate that the teacher IS assigned to this class and subject
        _mockTeacherAssignmentRepo
            .Setup(repo => repo.AnyAsync(It.IsAny<Expression<Func<TeacherAssignment, bool>>>()))
            .ReturnsAsync(true);

        // Act
        var result = await _teacherService.CreateAssignmentAsync(teacherId, dto);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be(dto.Title);
        result.Status.Should().Be(AssignmentStatus.Draft); // Should default to Draft
        
        _mockAssignmentRepo.Verify(repo => repo.AddAsync(It.IsAny<Assignment>()), Times.Once);
        _mockAssignmentRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateAssignmentAsync_WhenUnauthorized_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var teacherId = 2;
        var dto = new CreateAssignmentDto { ClassId = 1, SubjectId = 1 };

        // Simulate that the teacher is NOT assigned to this class and subject
        _mockTeacherAssignmentRepo
            .Setup(repo => repo.AnyAsync(It.IsAny<Expression<Func<TeacherAssignment, bool>>>()))
            .ReturnsAsync(false);

        // Act
        Func<Task> act = async () => await _teacherService.CreateAssignmentAsync(teacherId, dto);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("You are not authorized to create assignments for this class and subject.");
        
        _mockAssignmentRepo.Verify(repo => repo.AddAsync(It.IsAny<Assignment>()), Times.Never);
    }

    // ==========================================
    // GRADE SUBMISSION TESTS
    // ==========================================

    [Fact]
    public async Task GradeSubmissionAsync_WithValidMarks_UpdatesSubmissionSuccessfully()
    {
        // Arrange
        var teacherId = 2;
        var submission = MockDataFactory.GetTestSubmissions().First();
        var assignment = MockDataFactory.GetTestAssignments().First(a => a.Id == submission.AssignmentId);
        
        // Link the assignment to the submission for the test (simulating the .Include)
        submission.Assignment = assignment;

        var dto = new GradeSubmissionDto
        {
            MarksAwarded = 85, // Max marks is 100 in the mock factory
            Feedback = "Great job!",
            Status = SubmissionStatus.Graded
        };

        // Note: Using It.IsAny to mock the params array for FirstOrDefaultWithIncludesAsync
        _mockSubmissionRepo
            .Setup(repo => repo.FirstOrDefaultWithIncludesAsync(
                It.IsAny<Expression<Func<Submission, bool>>>(), 
                It.IsAny<Expression<Func<Submission, object>>[]>()))
            .ReturnsAsync(submission);

        // Act
        await _teacherService.GradeSubmissionAsync(teacherId, submission.Id, dto);

        // Assert
        submission.MarksAwarded.Should().Be(85);
        submission.Feedback.Should().Be("Great job!");
        submission.Status.Should().Be(SubmissionStatus.Graded);
        
        _mockSubmissionRepo.Verify(repo => repo.Update(It.IsAny<Submission>()), Times.Once);
        _mockSubmissionRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task GradeSubmissionAsync_ExceedingMaxMarks_ThrowsInvalidOperationException()
    {
        // Arrange
        var teacherId = 2;
        var submission = MockDataFactory.GetTestSubmissions().First();
        var assignment = MockDataFactory.GetTestAssignments().First(a => a.Id == submission.AssignmentId);
        submission.Assignment = assignment; // Max marks = 100

        var dto = new GradeSubmissionDto
        {
            MarksAwarded = 150, // This exceeds the max marks
            Feedback = "Impossible score",
            Status = SubmissionStatus.Graded
        };

        _mockSubmissionRepo
            .Setup(repo => repo.FirstOrDefaultWithIncludesAsync(
                It.IsAny<Expression<Func<Submission, bool>>>(), 
                It.IsAny<Expression<Func<Submission, object>>[]>()))
            .ReturnsAsync(submission);

        // Act
        Func<Task> act = async () => await _teacherService.GradeSubmissionAsync(teacherId, submission.Id, dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Marks awarded cannot exceed the maximum marks (100).");
            
        _mockSubmissionRepo.Verify(repo => repo.Update(It.IsAny<Submission>()), Times.Never);
    }
    
    [Fact]
    public async Task GradeSubmissionAsync_ForOtherTeachersAssignment_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var wrongTeacherId = 999; // Not the teacher who created the assignment
        var submission = MockDataFactory.GetTestSubmissions().First();
        submission.Assignment = MockDataFactory.GetTestAssignments().First();

        var dto = new GradeSubmissionDto { MarksAwarded = 90, Status = SubmissionStatus.Graded };

        _mockSubmissionRepo
            .Setup(repo => repo.FirstOrDefaultWithIncludesAsync(
                It.IsAny<Expression<Func<Submission, bool>>>(), 
                It.IsAny<Expression<Func<Submission, object>>[]>()))
            .ReturnsAsync(submission);

        // Act
        Func<Task> act = async () => await _teacherService.GradeSubmissionAsync(wrongTeacherId, submission.Id, dto);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("You can only grade submissions for your own assignments.");
    }
}