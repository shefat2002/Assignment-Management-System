using System.Security.Claims;
using AssignmentSystem.Api.Data;
using AssignmentSystem.Api.DTOs.Student;
using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SubmissionAttachment = AssignmentSystem.Api.Models.Entities.SubmissionAttachment;

namespace AssignmentSystem.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Student")]
public class StudentController : ControllerBase
{
    private readonly AppDbContext _context;
    public StudentController(AppDbContext context)
    {
        _context = context;
    }
    
    //GET: api/student/assignments
    [HttpGet("assignments")]
    public async Task<IActionResult> GetStudentAssignments()
    {
        try
        {
            var  userClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if(!int.TryParse(userClaim, out int userId))
            {
                return Unauthorized(new { Message = "Invalid user ID." });
            }
            
            var enrolledClassIds = await _context.StudentEnrollments
                .Where(se => se.StudentId == userId)
                .Select(se => se.ClassId)
                .ToListAsync();
            
            var assignments = await _context.Assignments
                .Include(a=> a.Subject)
                .Include(a => a.Teacher)
                .Where(a => enrolledClassIds.Contains(a.ClassId) && a.Status == AssignmentStatus.Published)
                .OrderBy(a=>a.Deadline)
                .Select(a => new 
                {
                    a.Id,
                    a.Title,
                    a.Description,
                    a.Deadline,
                    a.MaxMarks,
                    a.AllowResubmission,
                    ClassName = a.Class!.Name,
                    SubjectName = a.Subject!.Name,
                    TeacherName = $"{a.Teacher!.FirstName} {a.Teacher.LastName}"
                    
                })
                .ToListAsync();
            return Ok(assignments);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while fetching assignments.", details = ex.Message });
        }
    }

    [HttpPost("assignments/{assignmentId}/submit")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(100 * 1024 * 1024)] // Limit request size to 100 MB
    [RequestFormLimits(MultipartBodyLengthLimit = 100 * 1024 * 1024)] // Limit form data size to 100 MB
    public async Task<IActionResult> SubmitAssignment([FromRoute] int assignmentId,
        [FromForm] SubmitAssignmentDto submitDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new {message = "Invalid user ID."});
            }
            
            // 1. Check/ Verify Assignment
            var assignment = await _context.Assignments.FirstOrDefaultAsync(a => a.Id == assignmentId && a.Status == AssignmentStatus.Published);
            if (assignment == null)
            {
                return NotFound(new {message = "Assignment not found or not published."});
            }
            
            // 2. Verify Student is enrolled or not
            var isEnrolled = await _context.StudentEnrollments.AnyAsync(se => se.StudentId == userId && se.ClassId == assignment.ClassId);
            if (!isEnrolled)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new {message = "You are not enrolled in the class for this assignment."});
            }
            
            // 3. Check submitted
            var existingSubmission = await _context.Submissions.
                Include(s => s.Attachments)
                .FirstOrDefaultAsync(s=>s.AssignmentId== assignmentId && s.StudentId == userId);
            if(existingSubmission != null && !assignment.AllowResubmission)
            {
                return BadRequest(new {message = "You have already submitted this assignment. Resubmission is not allowed for this assignment."});
            }
            
            // 4. Check late
            var isLate = DateTime.UtcNow > assignment.Deadline;
            var submissionFiles = new List<SubmissionAttachment>();

            // Process uploaded files
            if (submitDto.Files != null && submitDto.Files.Count > 0)
            {
                var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "submissions");
                
                if(!Directory.Exists(uploadPath))
                {
                    Directory.CreateDirectory(uploadPath);
                }

                foreach (var file in submitDto.Files)
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
                        FilePath = $"/uploads/submissions/{uniqueFileName}",
                        
                    });
                }
            }
            
            // Resubmit
            if (existingSubmission != null)
            {
                existingSubmission.Content = submitDto.Content ??  string.Empty;
                existingSubmission.UpdatedAt = DateTime.UtcNow;
                existingSubmission.Status = isLate ? SubmissionStatus.LateSubmission : SubmissionStatus.Submitted;
                
                existingSubmission.MarksAwarded = null; // Reset marks on resubmission
                existingSubmission.Feedback = null; // Reset feedback on resubmission

                foreach (var file in submissionFiles)
                {
                    existingSubmission.Attachments.Add(file);
                }
            }
            else
            {
                var submission = new Submission
                {
                    AssignmentId = assignmentId,
                    StudentId = userId,
                    Content = submitDto.Content ?? string.Empty,
                    Status = isLate ? SubmissionStatus.LateSubmission : SubmissionStatus.Submitted,
                    Attachments = submissionFiles,
                };
                _context.Submissions.Add(submission);
            }
            await _context.SaveChangesAsync();
            return Ok(new {message = "Assignment submitted successfully.", IsLate= isLate});
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while submitting the assignment.", details = ex.Message });
        }
    }
    
    
}