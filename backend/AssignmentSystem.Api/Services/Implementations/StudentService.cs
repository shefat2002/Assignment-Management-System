using AssignmentSystem.Api.DTOs.Student;
using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Models.Enums;
using AssignmentSystem.Api.Repositories.Interfaces;
using AssignmentSystem.Api.Services.Interfaces;

namespace AssignmentSystem.Api.Services.Implementations;

public class StudentService : IStudentService
{
    private readonly IGenericRepository<Assignment> _assignmentRepository;
    private readonly IGenericRepository<StudentEnrollment> _enrollmentRepository;
    private readonly IGenericRepository<Submission> _submissionRepository;
    private readonly IWebHostEnvironment _env;

    public StudentService(
        IGenericRepository<Assignment> assignmentRepository,
        IGenericRepository<StudentEnrollment> enrollmentRepository,
        IGenericRepository<Submission> submissionRepository,
        IWebHostEnvironment env)
    {
        _assignmentRepository = assignmentRepository;
        _enrollmentRepository = enrollmentRepository;
        _submissionRepository = submissionRepository;
        _env = env;
    }
    
    public async Task<IEnumerable<Assignment>> GetStudentAssignmentsAsync(int studentId)
    {
        var enrollments = await _enrollmentRepository.FindAsync(se => se.StudentId == studentId);
        var enrolledClassIds = enrollments.Select(se => se.ClassId).ToList();

        return await _assignmentRepository.FindWithIncludesAsync(
            a => enrolledClassIds.Contains(a.ClassId) && a.Status == AssignmentStatus.Published,
            a => a.Subject!,
            a => a.Teacher!,
            a => a.Class!);
    }

    public async Task<Assignment?> GetAssignmentByIdAsync(int studentId, int assignmentId)
    {
        var assignment = await _assignmentRepository.FirstOrDefaultWithIncludesAsync(
            a => a.Id == assignmentId && a.Status == AssignmentStatus.Published,
            a => a.Subject!,
            a => a.Teacher!,
            a => a.Class!);

        if (assignment == null) return null;

        // Verify enrollment
        if (!await _enrollmentRepository.AnyAsync(se => se.StudentId == studentId && se.ClassId == assignment.ClassId))
            throw new UnauthorizedAccessException("You are not enrolled in the class for this assignment.");

        return assignment;
    }

    public async Task<Submission?> GetMySubmissionAsync(int studentId, int assignmentId)
    {
        return await _submissionRepository.FirstOrDefaultWithIncludesAsync(
            s => s.StudentId == studentId && s.AssignmentId == assignmentId,
            s => s.Attachments);
    }

    public async Task<(bool IsLate, string Message)> SubmitAssignmentAsync(int studentId, int assignmentId, SubmitAssignmentDto dto)
    {
        var assignment = await _assignmentRepository.GetByIdAsync(assignmentId) 
            ?? throw new KeyNotFoundException("Assignment not found or not published.");

        if (assignment.Status != AssignmentStatus.Published)
            throw new KeyNotFoundException("Assignment not found or not published.");

        if (!await _enrollmentRepository.AnyAsync(se => se.StudentId == studentId && se.ClassId == assignment.ClassId))
            throw new UnauthorizedAccessException("You are not enrolled in the class for this assignment.");

        var existingSubmission = await _submissionRepository.FirstOrDefaultWithIncludesAsync(
            s => s.AssignmentId == assignmentId && s.StudentId == studentId, 
            s => s.Attachments);

        if (existingSubmission != null && !assignment.AllowResubmission)
            throw new InvalidOperationException("You have already submitted this assignment. Resubmission is not allowed.");

        var isLate = DateTime.UtcNow > assignment.Deadline;
        var submissionFiles = new List<SubmissionAttachment>();

        // Process uploaded files
        if (dto.Files != null && dto.Files.Count > 0)
        {
            var uploadPath = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "submissions");
            
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            foreach (var file in dto.Files)
            {
                var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                var filePath = Path.Combine(uploadPath, uniqueFileName);
                
                await using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                
                submissionFiles.Add(new SubmissionAttachment
                {
                    OriginalFileName = file.FileName,
                    FilePath = $"/uploads/submissions/{uniqueFileName}"
                });
            }
        }

        if (existingSubmission != null)
        {
            // Handle Resubmission
            existingSubmission.Content = dto.Content ?? string.Empty;
            existingSubmission.UpdatedAt = DateTime.UtcNow;
            existingSubmission.Status = isLate ? SubmissionStatus.LateSubmission : SubmissionStatus.Submitted;
            existingSubmission.MarksAwarded = null; // Reset marks
            existingSubmission.Feedback = null;     // Reset feedback

            foreach (var file in submissionFiles)
            {
                existingSubmission.Attachments.Add(file);
            }
            _submissionRepository.Update(existingSubmission);
        }
        else
        {
            // Handle New Submission
            var submission = new Submission
            {
                AssignmentId = assignmentId,
                StudentId = studentId,
                Content = dto.Content ?? string.Empty,
                Status = isLate ? SubmissionStatus.LateSubmission : SubmissionStatus.Submitted,
                Attachments = submissionFiles,
            };
            await _submissionRepository.AddAsync(submission);
        }

        await _submissionRepository.SaveChangesAsync();

        return (isLate, "Assignment submitted successfully.");
    }
}