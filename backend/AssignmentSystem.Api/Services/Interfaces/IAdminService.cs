using AssignmentSystem.Api.DTOs.Admin;
using AssignmentSystem.Api.Models.Entities;

namespace AssignmentSystem.Api.Services.Interfaces;

public interface IAdminService
{
    // Users
    Task<IEnumerable<User>> GetAllUsersAsync();
    Task<User?> GetUserByIdAsync(int id);
    Task<User> CreateUserAsync(CreateUserDto dto);
    Task UpdateUserAsync(int id, UpdateUserDto dto);
    Task DeleteUserAsync(int id);

    // Classes
    Task<IEnumerable<Class>> GetAllClassesAsync();
    Task<Class?> GetClassByIdAsync(int id);
    Task<Class> CreateClassAsync(CreateClassDto dto);
    Task UpdateClassAsync(int id, UpdateClassDto dto);
    Task DeleteClassAsync(int id);

    // Subjects
    Task<IEnumerable<Subject>> GetAllSubjectsAsync();
    Task<Subject?> GetSubjectByIdAsync(int id);
    Task<Subject> CreateSubjectAsync(CreateSubjectDto dto);
    Task UpdateSubjectAsync(int id, UpdateSubjectDto dto);
    Task DeleteSubjectAsync(int id);

    // Assignments & Enrollments
    Task AssignTeacherAsync(AssignTeacherDto dto);
    Task UnassignTeacherAsync(int id);
    Task EnrollStudentAsync(EnrollStudentDto dto);
    Task UnenrollStudentAsync(int id);
    
    // Get Info
    Task<IEnumerable<Assignment>> GetAllAssignmentsAsync();
    Task<IEnumerable<Submission>> GetAllSubmissionsAsync();
}