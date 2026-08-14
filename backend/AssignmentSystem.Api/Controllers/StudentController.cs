using System.Security.Claims;
using AssignmentSystem.Api.Data;
using AssignmentSystem.Api.DTOs.Student;
using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Models.Enums;
using AssignmentSystem.Api.Services.Interfaces;
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
    private readonly IStudentService _studentService;

    public StudentController(IStudentService studentService)
    {
        _studentService = studentService;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId)) throw new UnauthorizedAccessException("Invalid user ID.");
        return userId;
    }

    [HttpGet("assignments")]
    public async Task<IActionResult> GetStudentAssignments()
    {
        try
        {
            var assignments = await _studentService.GetStudentAssignmentsAsync(GetUserId());
            return Ok(assignments.Select(a => new
            {
                a.Id, a.Title, a.Description, a.Deadline, a.MaxMarks, a.AllowResubmission,
                ClassName = a.Class!.Name,
                SubjectName = a.Subject!.Name,
                TeacherName = $"{a.Teacher!.FirstName} {a.Teacher.LastName}"
            }));
        }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { Message = ex.Message }); }
    }

    [HttpGet("assignments/{id}")]
    public async Task<IActionResult> GetAssignmentDetails(int id)
    {
        try
        {
            var assignment = await _studentService.GetAssignmentByIdAsync(GetUserId(), id);
            if (assignment == null) return NotFound(new { Message = "Assignment not found." });

            return Ok(new
            {
                assignment.Id, assignment.Title, assignment.Description, assignment.Deadline, 
                assignment.MaxMarks, assignment.AllowResubmission,
                ClassName = assignment.Class!.Name,
                SubjectName = assignment.Subject!.Name,
                TeacherName = $"{assignment.Teacher!.FirstName} {assignment.Teacher.LastName}"
            });
        }
        catch (UnauthorizedAccessException ex) { return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message }); }
    }

    [HttpGet("assignments/{assignmentId}/my-submission")]
    public async Task<IActionResult> GetMySubmission(int assignmentId)
    {
        var submission = await _studentService.GetMySubmissionAsync(GetUserId(), assignmentId);
        if (submission == null) return NotFound(new { Message = "You have not submitted this assignment yet." });

        return Ok(new
        {
            submission.Id, submission.Content, submission.SubmittedAt, 
            submission.MarksAwarded, submission.Feedback, 
            Status = submission.Status.ToString(),
            Attachments = submission.Attachments.Select(a => new { a.OriginalFileName, a.FilePath })
        });
    }

    [HttpPost("assignments/{assignmentId}/submit")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(100 * 1024 * 1024)] // Limit request size to 100 MB
    [RequestFormLimits(MultipartBodyLengthLimit = 100 * 1024 * 1024)]
    public async Task<IActionResult> SubmitAssignment([FromRoute] int assignmentId, [FromForm] SubmitAssignmentDto submitDto)
    {
        try
        {
            var result = await _studentService.SubmitAssignmentAsync(GetUserId(), assignmentId, submitDto);
            return Ok(new { Message = result.Message, IsLate = result.IsLate });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (UnauthorizedAccessException ex) { return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (Exception ex) { return StatusCode(500, new { Message = "An error occurred while submitting.", Details = ex.Message }); }
    }

    [HttpGet("submissions")]
    public async Task<IActionResult> GetMySubmissions()
    {
        try
        {
            var submissions = await _studentService.GetMySubmissionsAsync(GetUserId());
            return Ok(submissions.Select(s => new
            {
                s.Id,
                AssignmentId = s.AssignmentId,
                AssignmentTitle = s.Assignment!.Title,
                SubjectName = s.Assignment.Subject!.Name,
                Deadline = s.Assignment.Deadline,
                MaxMarks = s.Assignment.MaxMarks,
                AllowResubmission = s.Assignment.AllowResubmission,
                s.Content,
                s.SubmittedAt,
                s.MarksAwarded,
                s.Feedback,
                Status = s.Status.ToString(),
                Attachments = s.Attachments.Select(a => new { a.OriginalFileName, a.FilePath })
            }));
        }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { Message = ex.Message }); }
    }
}