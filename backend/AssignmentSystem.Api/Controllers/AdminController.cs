using AssignmentSystem.Api.Data;
using AssignmentSystem.Api.DTOs.Admin;
using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Models.Enums;
using AssignmentSystem.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSystem.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }
    
    // User
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _adminService.GetAllUsersAsync();
        return Ok(users.Select(u => new { u.Id, u.FirstName, u.LastName, u.Email, u.Role, u.CreatedAt }));
    }

    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _adminService.GetUserByIdAsync(id);
        if (user == null) return NotFound(new { Message = "User not found." });
        return Ok(new { user.Id, user.FirstName, user.LastName, user.Email, user.Role, user.CreatedAt });
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        try
        {
            var user = await _adminService.CreateUserAsync(dto);
            return Ok(new { Message = "User created successfully", UserId = user.Id });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { Message = ex.Message }); }
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
    {
        try
        {
            await _adminService.UpdateUserAsync(id, dto);
            return Ok(new { Message = "User updated successfully." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { Message = ex.Message }); }
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            await _adminService.DeleteUserAsync(id);
            return Ok(new { Message = "User deleted successfully." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
    }
    
    // Class
    
    [HttpGet("classes")]
    public async Task<IActionResult> GetClasses() => Ok(await _adminService.GetAllClassesAsync());

    [HttpGet("classes/{id}")]
    public async Task<IActionResult> GetClass(int id)
    {
        var classEntity = await _adminService.GetClassByIdAsync(id);
        if (classEntity == null) return NotFound(new { Message = "Class not found." });
        return Ok(classEntity);
    }

    [HttpPost("classes")]
    public async Task<IActionResult> CreateClass([FromBody] CreateClassDto dto)
    {
        var newClass = await _adminService.CreateClassAsync(dto);
        return Ok(new { Message = "Class created successfully.", ClassId = newClass.Id });
    }

    [HttpPut("classes/{id}")]
    public async Task<IActionResult> UpdateClass(int id, [FromBody] UpdateClassDto dto)
    {
        try
        {
            await _adminService.UpdateClassAsync(id, dto);
            return Ok(new { Message = "Class updated successfully." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
    }

    [HttpDelete("classes/{id}")]
    public async Task<IActionResult> DeleteClass(int id)
    {
        try
        {
            await _adminService.DeleteClassAsync(id);
            return Ok(new { Message = "Class deleted successfully." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
    }
    
    // Subject
    [HttpGet("subjects")]
    public async Task<IActionResult> GetSubjects() => Ok(await _adminService.GetAllSubjectsAsync());

    [HttpGet("subjects/{id}")]
    public async Task<IActionResult> GetSubject(int id)
    {
        var subject = await _adminService.GetSubjectByIdAsync(id);
        if (subject == null) return NotFound(new { Message = "Subject not found." });
        return Ok(subject);
    }

    [HttpPost("subjects")]
    public async Task<IActionResult> CreateSubject([FromBody] CreateSubjectDto dto)
    {
        var subject = await _adminService.CreateSubjectAsync(dto);
        return Ok(new { Message = "Subject created successfully.", SubjectId = subject.Id });
    }

    [HttpPut("subjects/{id}")]
    public async Task<IActionResult> UpdateSubject(int id, [FromBody] UpdateSubjectDto dto)
    {
        try
        {
            await _adminService.UpdateSubjectAsync(id, dto);
            return Ok(new { Message = "Subject updated successfully." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
    }

    [HttpDelete("subjects/{id}")]
    public async Task<IActionResult> DeleteSubject(int id)
    {
        try
        {
            await _adminService.DeleteSubjectAsync(id);
            return Ok(new { Message = "Subject deleted successfully." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
    }
    
    // Assign teacher
    [HttpPost("assign-teacher")]
    public async Task<IActionResult> AssignTeacher([FromBody] AssignTeacherDto dto)
    {
        try
        {
            await _adminService.AssignTeacherAsync(dto);
            return Ok(new { Message = "Teacher assigned successfully." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { Message = ex.Message }); }
    }

    [HttpDelete("assign-teacher/{id}")]
    public async Task<IActionResult> UnassignTeacher(int id)
    {
        try
        {
            await _adminService.UnassignTeacherAsync(id);
            return Ok(new { Message = "Teacher unassigned successfully." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
    }
    
    // entroll stidetn
    
    [HttpPost("enroll-student")]
    public async Task<IActionResult> EnrollStudent([FromBody] EnrollStudentDto dto)
    {
        try
        {
            await _adminService.EnrollStudentAsync(dto);
            return Ok(new { Message = "Student enrolled successfully." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { Message = ex.Message }); }
    }

    [HttpDelete("enroll-student/{id}")]
    public async Task<IActionResult> UnenrollStudent(int id)
    {
        try
        {
            await _adminService.UnenrollStudentAsync(id);
            return Ok(new { Message = "Student unenrolled successfully." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
    }
    
    [HttpGet("assignments")]
    public async Task<IActionResult> GetAllAssignments()
    {
        var assignments = await _adminService.GetAllAssignmentsAsync();
        return Ok(assignments.Select(a => new
        {
            a.Id, 
            a.Title, 
            a.Deadline, 
            a.MaxMarks, 
            Status = a.Status.ToString(),
            TeacherName = $"{a.Teacher!.FirstName} {a.Teacher.LastName}",
            ClassName = a.Class!.Name,
            SubjectName = a.Subject!.Name
        }));
    }

    [HttpGet("submissions")]
    public async Task<IActionResult> GetAllSubmissions()
    {
        var submissions = await _adminService.GetAllSubmissionsAsync();
        return Ok(submissions.Select(s => new
        {
            s.Id, 
            s.AssignmentId, 
            s.SubmittedAt, 
            Status = s.Status.ToString(), 
            s.MarksAwarded,
            StudentName = $"{s.Student!.FirstName} {s.Student.LastName}",
            AssignmentTitle = s.Assignment!.Title
        }));
    }
}