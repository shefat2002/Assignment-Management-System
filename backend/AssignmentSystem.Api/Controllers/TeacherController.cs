using System.Security.Claims;
using AssignmentSystem.Api.Data;
using AssignmentSystem.Api.DTOs.Teacher;
using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Models.Enums;
using AssignmentSystem.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSystem.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Teacher")]
public class TeacherController: ControllerBase
{
    private readonly ITeacherService _teacherService;

    public TeacherController(ITeacherService teacherService)
    {
        _teacherService = teacherService;
    }
    
    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId)) throw new UnauthorizedAccessException("Invalid user ID.");
        return userId;
    }
    
    // Assignments
    [HttpGet("assignments")]
    public async Task<IActionResult> GetMyAssignments()
    {
        try
        {
            var assignments = await _teacherService.GetTeacherAssignmentsAsync(GetUserId());
            return Ok(assignments.Select(a => new
            {
                a.Id, a.Title, a.Description, a.Deadline, a.MaxMarks, a.Status, a.AllowResubmission,
                ClassName = a.Class!.Name, SubjectName = a.Subject!.Name
            }));
        }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { Message = ex.Message }); }
    }

    [HttpGet("assignments/{id}")]
    public async Task<IActionResult> GetAssignment(int id)
    {
        var assignment = await _teacherService.GetAssignmentByIdAsync(id);
        if (assignment == null) return NotFound(new { Message = "Assignment not found." });
        return Ok(assignment);
    }

    [HttpPost("assignments")]
    public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentDto dto)
    {
        try
        {
            var assignment = await _teacherService.CreateAssignmentAsync(GetUserId(), dto);
            return CreatedAtAction(nameof(GetAssignment), new { id = assignment.Id }, assignment);
        }
        catch (UnauthorizedAccessException ex) { return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message }); }
    }

    [HttpPut("assignments/{id}")]
    public async Task<IActionResult> UpdateAssignment(int id, [FromBody] UpdateAssignmentDto dto)
    {
        try
        {
            await _teacherService.UpdateAssignmentAsync(GetUserId(), id, dto);
            return Ok(new { Message = "Assignment updated successfully." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (UnauthorizedAccessException ex) { return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message }); }
    }

    [HttpDelete("assignments/{id}")]
    public async Task<IActionResult> DeleteAssignment(int id)
    {
        try
        {
            await _teacherService.DeleteAssignmentAsync(GetUserId(), id);
            return Ok(new { Message = "Assignment deleted successfully." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (UnauthorizedAccessException ex) { return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message }); }
    }
    
}