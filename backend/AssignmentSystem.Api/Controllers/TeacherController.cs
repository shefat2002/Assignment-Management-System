using System.Security.Claims;
using AssignmentSystem.Api.Data;
using AssignmentSystem.Api.DTOs.Teacher;
using AssignmentSystem.Api.Models.Enitites;
using AssignmentSystem.Api.Models.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSystem.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TeacherController: ControllerBase
{
    private readonly AppDbContext _context;

    public TeacherController(AppDbContext context)
    {
        _context = context;
    }
    
    // POST: api/teacher/assignments
    [HttpPost("assignments")]
    public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentDto assignment)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if(!int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized(new { Message = "Invalid user ID." });
        }
        var isAuthorized = await _context.TeacherAssignments
            .AnyAsync(ta => ta.TeacherId == userId 
                            && ta.ClassId == assignment.ClassId
                            && ta.SubjectId == assignment.SubjectId);
        if (!isAuthorized)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { Message = "You are not authorized to create assignments for this class and subject." });
        }

        var newAssignment = new Assignment
        {
            Title = assignment.Title,
            Description = assignment.Description,
            Deadline = assignment.DueDate,
            MaxMarks = assignment.TotalMarks,
            AllowResubmission = assignment.AllowResubmission,
            ClassId = assignment.ClassId,
            SubjectId = assignment.SubjectId,
            TeacherId = userId,
            Status = AssignmentStatus.Draft
        };
        return CreatedAtAction(nameof(GetAssignment), new { id = newAssignment.Id }, newAssignment);
    }
    // GET: api/teacher/assignments/{id}
    [HttpGet("assignments/{id}")]
    public async Task<IActionResult> GetAssignment(int id)
    {
        var assignment = await _context.Assignments
            .Include(a => a.Class)
            .Include(a => a.Subject)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (assignment == null)
        {
            return NotFound(new { Message = "Assignment not found." });
        }
            
        return Ok(assignment);
    }
    
}