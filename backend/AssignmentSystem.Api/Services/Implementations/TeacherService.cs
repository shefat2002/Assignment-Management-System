using AssignmentSystem.Api.DTOs.Teacher;
using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Models.Enums;
using AssignmentSystem.Api.Repositories.Interfaces;
using AssignmentSystem.Api.Services.Interfaces;

namespace AssignmentSystem.Api.Services.Implementations;

public class TeacherService : ITeacherService
{
    private readonly IGenericRepository<Assignment> _assignmentRepository;
    private readonly IGenericRepository<TeacherAssignment> _teacherAssignmentRepository;
    private readonly IGenericRepository<Submission> _submissionRepository;
    private readonly IGenericRepository<StudentEnrollment> _enrollmentRepository;

    public TeacherService(
        IGenericRepository<Assignment> assignmentRepository, 
        IGenericRepository<TeacherAssignment> teacherAssignmentRepository,
        IGenericRepository<Submission> submissionRepository,
        IGenericRepository<StudentEnrollment> enrollmentRepository)
    {
        _assignmentRepository = assignmentRepository;
        _teacherAssignmentRepository = teacherAssignmentRepository;
        _submissionRepository = submissionRepository;
        _enrollmentRepository = enrollmentRepository;
    }
    
    // Assignments
    public async Task<Assignment> CreateAssignmentAsync(int teacherId, CreateAssignmentDto dto)
    {
        var isAuthorized = await _teacherAssignmentRepository.AnyAsync(ta => 
            ta.TeacherId == teacherId && ta.ClassId == dto.ClassId && ta.SubjectId == dto.SubjectId);

        if (!isAuthorized)
            throw new UnauthorizedAccessException("You are not authorized to create assignments for this class and subject.");

        var newAssignment = new Assignment
        {
            Title = dto.Title,
            Description = dto.Description,
            Deadline = dto.DueDate,
            MaxMarks = dto.TotalMarks,
            AllowResubmission = dto.AllowResubmission,
            ClassId = dto.ClassId,
            SubjectId = dto.SubjectId,
            TeacherId = teacherId,
            Status = AssignmentStatus.Draft
        };

        await _assignmentRepository.AddAsync(newAssignment);
        await _assignmentRepository.SaveChangesAsync();
        return newAssignment;
    }

    public async Task<Assignment?> GetAssignmentByIdAsync(int id)
    {
        return await _assignmentRepository.FirstOrDefaultWithIncludesAsync(
            a => a.Id == id, 
            a => a.Class!, 
            a => a.Subject!);
    }
    public async Task<IEnumerable<Assignment>> GetTeacherAssignmentsAsync(int teacherId)
    {
        return await _assignmentRepository.FindWithIncludesAsync(
            a => a.TeacherId == teacherId, 
            a => a.Class!, 
            a => a.Subject!);
    }
    public async Task UpdateAssignmentAsync(int teacherId, int assignmentId, UpdateAssignmentDto dto)
    {
        var assignment = await _assignmentRepository.GetByIdAsync(assignmentId) 
                         ?? throw new KeyNotFoundException("Assignment not found.");

        if (assignment.TeacherId != teacherId)
            throw new UnauthorizedAccessException("You can only update your own assignments.");

        assignment.Title = dto.Title;
        assignment.Description = dto.Description;
        assignment.Deadline = dto.DueDate;
        assignment.MaxMarks = dto.TotalMarks;
        assignment.AllowResubmission = dto.AllowResubmission;
        assignment.Status = dto.Status; // Allows publishing
        assignment.UpdatedAt = DateTime.UtcNow;

        _assignmentRepository.Update(assignment);
        await _assignmentRepository.SaveChangesAsync();
    }
    public async Task DeleteAssignmentAsync(int teacherId, int assignmentId)
    {
        var assignment = await _assignmentRepository.GetByIdAsync(assignmentId) 
                         ?? throw new KeyNotFoundException("Assignment not found.");

        if (assignment.TeacherId != teacherId)
            throw new UnauthorizedAccessException("You can only delete your own assignments.");

        _assignmentRepository.Delete(assignment);
        await _assignmentRepository.SaveChangesAsync();
    }
    
    // Students & Submissions
    
    public async Task<IEnumerable<User>> GetEnrolledStudentsAsync(int teacherId)
    {
        var teacherAssignments = await _teacherAssignmentRepository.FindAsync(ta => ta.TeacherId == teacherId);
        var classIds = teacherAssignments.Select(ta => ta.ClassId).Distinct().ToList();

        var enrollments = await _enrollmentRepository.FindWithIncludesAsync(
            se => classIds.Contains(se.ClassId), 
            se => se.Student!);

        return enrollments.Select(se => se.Student!).DistinctBy(s => s.Id);
    }

    public async Task<IEnumerable<Submission>> GetAssignmentSubmissionsAsync(int teacherId, int assignmentId)
    {
        var assignment = await _assignmentRepository.GetByIdAsync(assignmentId) 
            ?? throw new KeyNotFoundException("Assignment not found.");

        if (assignment.TeacherId != teacherId)
            throw new UnauthorizedAccessException("You can only view submissions for your own assignments.");

        return await _submissionRepository.FindWithIncludesAsync(
            s => s.AssignmentId == assignmentId,
            s => s.Student!,
            s => s.Attachments);
    }

    public async Task GradeSubmissionAsync(int teacherId, int submissionId, GradeSubmissionDto dto)
    {
        var submission = await _submissionRepository.FirstOrDefaultWithIncludesAsync(s => s.Id == submissionId, s => s.Assignment!) 
            ?? throw new KeyNotFoundException("Submission not found.");

        if (submission.Assignment!.TeacherId != teacherId)
            throw new UnauthorizedAccessException("You can only grade submissions for your own assignments.");

        if (dto.MarksAwarded > submission.Assignment.MaxMarks)
            throw new InvalidOperationException($"Marks awarded cannot exceed the maximum marks ({submission.Assignment.MaxMarks}).");

        submission.MarksAwarded = dto.MarksAwarded;
        submission.Feedback = dto.Feedback;
        submission.Status = dto.Status;
        submission.UpdatedAt = DateTime.UtcNow;

        _submissionRepository.Update(submission);
        await _submissionRepository.SaveChangesAsync();
    }
}