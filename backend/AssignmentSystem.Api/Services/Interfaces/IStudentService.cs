using AssignmentSystem.Api.DTOs.Student;
using AssignmentSystem.Api.Models.Entities;

namespace AssignmentSystem.Api.Services.Interfaces;

public interface IStudentService
{
    Task<IEnumerable<Assignment>> GetStudentAssignmentsAsync(int studentId);
    Task<Assignment?> GetAssignmentByIdAsync(int studentId, int assignmentId);
    Task<Submission?> GetMySubmissionAsync(int studentId, int assignmentId);
    Task<(bool IsLate, string Message)> SubmitAssignmentAsync(int studentId, int assignmentId, SubmitAssignmentDto dto);
}