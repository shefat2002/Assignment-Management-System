using AssignmentSystem.Api.DTOs.Teacher;
using AssignmentSystem.Api.Models.Entities;

namespace AssignmentSystem.Api.Services.Interfaces;

public interface ITeacherService
{
    // Assignments
    Task<IEnumerable<Assignment>> GetTeacherAssignmentsAsync(int teacherId);
    Task<Assignment?> GetAssignmentByIdAsync(int id);
    Task<Assignment> CreateAssignmentAsync(int teacherId, CreateAssignmentDto dto);
    Task UpdateAssignmentAsync(int teacherId, int assignmentId, UpdateAssignmentDto dto);
    Task DeleteAssignmentAsync(int teacherId, int assignmentId);

    // Students & Submissions
    Task<IEnumerable<User>> GetEnrolledStudentsAsync(int teacherId);
    Task<IEnumerable<Submission>> GetAssignmentSubmissionsAsync(int teacherId, int assignmentId);
    Task GradeSubmissionAsync(int teacherId, int submissionId, GradeSubmissionDto dto);
    
}