using System.Linq.Expressions;
using AssignmentSystem.Api.DTOs.Admin;
using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Models.Enums;
using AssignmentSystem.Api.Repositories.Interfaces;
using AssignmentSystem.Api.Services.Implementations;
using AssignmentSystem.Tests.Mocks;
using FluentAssertions;
using Moq;

namespace AssignmentSystem.Tests.Services;

public class AdminServiceTests
{
    private readonly Mock<IGenericRepository<User>> _mockUserRepo;
    private readonly Mock<IGenericRepository<Class>> _mockClassRepo;
    private readonly Mock<IGenericRepository<Subject>> _mockSubjectRepo;
    private readonly Mock<IGenericRepository<TeacherAssignment>> _mockTeacherAssignmentRepo;
    private readonly Mock<IGenericRepository<StudentEnrollment>> _mockStudentEnrollmentRepo;
    private readonly Mock<IGenericRepository<Assignment>> _mockAssignmentRepo;
    private readonly Mock<IGenericRepository<Submission>> _mockSubmissionRepo;
    private readonly AdminService _adminService;

    public AdminServiceTests()
    {
        _mockUserRepo = new Mock<IGenericRepository<User>>();
        _mockClassRepo = new Mock<IGenericRepository<Class>>();
        _mockSubjectRepo = new Mock<IGenericRepository<Subject>>();
        _mockTeacherAssignmentRepo = new Mock<IGenericRepository<TeacherAssignment>>();
        _mockStudentEnrollmentRepo = new Mock<IGenericRepository<StudentEnrollment>>();
        _mockAssignmentRepo = new Mock<IGenericRepository<Assignment>>();
        _mockSubmissionRepo = new Mock<IGenericRepository<Submission>>();

        _adminService = new AdminService(
            _mockUserRepo.Object,
            _mockClassRepo.Object,
            _mockSubjectRepo.Object,
            _mockTeacherAssignmentRepo.Object,
            _mockStudentEnrollmentRepo.Object,
            _mockAssignmentRepo.Object,
            _mockSubmissionRepo.Object
        );
    }

    // ==========================================
    // CREATE USER TESTS
    // ==========================================

    [Fact]
    public async Task CreateUserAsync_WithValidData_CreatesAndReturnsUser()
    {
        // Arrange
        var dto = new CreateUserDto
        {
            FirstName = "New",
            LastName = "Teacher",
            Email = "new.teacher@test.com",
            Password = "Password123!",
            Role = UserRole.Teacher
        };

        // Simulate that the email does not exist in the database
        _mockUserRepo.Setup(repo => repo.AnyAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(false);

        // Act
        var result = await _adminService.CreateUserAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.Email.Should().Be(dto.Email);
        result.Role.Should().Be(UserRole.Teacher);
        
        // Verify that AddAsync and SaveChangesAsync were actually called exactly once
        _mockUserRepo.Verify(repo => repo.AddAsync(It.IsAny<User>()), Times.Once);
        _mockUserRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateUserAsync_WithExistingEmail_ThrowsInvalidOperationException()
    {
        // Arrange
        var existingUser = MockDataFactory.GetTestUsers().First();
        var dto = new CreateUserDto { Email = existingUser.Email, Password = "password" };

        // Simulate that the email already exists
        _mockUserRepo.Setup(repo => repo.AnyAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(true);

        // Act
        Func<Task> act = async () => await _adminService.CreateUserAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Email is already in use.");
        
        // Verify we never tried to save
        _mockUserRepo.Verify(repo => repo.AddAsync(It.IsAny<User>()), Times.Never);
    }

    // ==========================================
    // ASSIGN TEACHER TESTS
    // ==========================================

    [Fact]
    public async Task AssignTeacherAsync_WithValidData_AssignsSuccessfully()
    {
        // Arrange
        var teacher = MockDataFactory.GetTestUsers().First(u => u.Role == UserRole.Teacher);
        var dto = new AssignTeacherDto { TeacherId = teacher.Id, ClassId = 1, SubjectId = 1 };

        // 1. Simulate finding the teacher
        _mockUserRepo.Setup(repo => repo.FirstOrDefaultAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(teacher);

        // 2. Simulate no existing assignment
        _mockTeacherAssignmentRepo.Setup(repo => repo.AnyAsync(It.IsAny<Expression<Func<TeacherAssignment, bool>>>()))
            .ReturnsAsync(false);

        // Act
        await _adminService.AssignTeacherAsync(dto);

        // Assert
        _mockTeacherAssignmentRepo.Verify(repo => repo.AddAsync(It.IsAny<TeacherAssignment>()), Times.Once);
        _mockTeacherAssignmentRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task AssignTeacherAsync_WithDuplicateAssignment_ThrowsInvalidOperationException()
    {
        // Arrange
        var teacher = MockDataFactory.GetTestUsers().First(u => u.Role == UserRole.Teacher);
        var existingAssignment = MockDataFactory.GetTestTeacherAssignments().First();
        
        var dto = new AssignTeacherDto 
        { 
            TeacherId = existingAssignment.TeacherId, 
            ClassId = existingAssignment.ClassId, 
            SubjectId = existingAssignment.SubjectId 
        };

        // Simulate finding the teacher
        _mockUserRepo.Setup(repo => repo.FirstOrDefaultAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(teacher);

        // Simulate finding an existing duplicate assignment
        _mockTeacherAssignmentRepo.Setup(repo => repo.AnyAsync(It.IsAny<Expression<Func<TeacherAssignment, bool>>>()))
            .ReturnsAsync(true);

        // Act
        Func<Task> act = async () => await _adminService.AssignTeacherAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Teacher is already assigned to this class, subject, and section combination.");
    }
    
    [Fact]
    public async Task AssignTeacherAsync_WithNonExistentTeacher_ThrowsKeyNotFoundException()
    {
        // Arrange
        var dto = new AssignTeacherDto { TeacherId = 999, ClassId = 1, SubjectId = 1 };

        // Simulate teacher not found
        _mockUserRepo.Setup(repo => repo.FirstOrDefaultAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync((User?)null);

        // Act
        Func<Task> act = async () => await _adminService.AssignTeacherAsync(dto);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("Teacher not found.");
    }
    // ==========================================
    // GLOBAL DATA VIEW TESTS
    // ==========================================

    [Fact]
    public async Task GetAllAssignmentsAsync_ReturnsAllAssignments()
    {
        // Arrange
        var mockAssignments = MockDataFactory.GetTestAssignments();
        
        _mockAssignmentRepo.Setup(repo => repo.FindWithIncludesAsync(
                It.IsAny<Expression<Func<Assignment, bool>>>(),
                It.IsAny<Expression<Func<Assignment, object>>[]>()))
            .ReturnsAsync(mockAssignments);

        // Act
        var result = await _adminService.GetAllAssignmentsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(mockAssignments.Count);
        
        _mockAssignmentRepo.Verify(repo => repo.FindWithIncludesAsync(
            It.IsAny<Expression<Func<Assignment, bool>>>(),
            It.IsAny<Expression<Func<Assignment, object>>[]>()), Times.Once);
    }

    [Fact]
    public async Task GetAllSubmissionsAsync_ReturnsAllSubmissions()
    {
        // Arrange
        var mockSubmissions = MockDataFactory.GetTestSubmissions();
        
        _mockSubmissionRepo.Setup(repo => repo.FindWithIncludesAsync(
                It.IsAny<Expression<Func<Submission, bool>>>(),
                It.IsAny<Expression<Func<Submission, object>>[]>()))
            .ReturnsAsync(mockSubmissions);

        // Act
        var result = await _adminService.GetAllSubmissionsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(mockSubmissions.Count);
        
        _mockSubmissionRepo.Verify(repo => repo.FindWithIncludesAsync(
            It.IsAny<Expression<Func<Submission, bool>>>(),
            It.IsAny<Expression<Func<Submission, object>>[]>()), Times.Once);
    }
}