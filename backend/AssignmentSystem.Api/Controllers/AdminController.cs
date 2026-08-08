using AssignmentSystem.Api.Data;
using AssignmentSystem.Api.DTOs.Admin;
using AssignmentSystem.Api.Models.Enitites;
using AssignmentSystem.Api.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSystem.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;
    public AdminController(AppDbContext context)
    {
        _context = context;
    }
    
    // POST: api/admin/users
    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto newUser)
    {
        var existingUser = await _context.Users.AnyAsync(u => u.Email == newUser.Email);
        if(existingUser)
        {
            return BadRequest("User with this email already exists.");
        }
        var user = new User
        {
            FirstName = newUser.FirstName,
            LastName = newUser.LastName,
            Email = newUser.Email,
            Role = newUser.Role,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(newUser.Password)
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return Ok(new {Message = "User created successfully", UserId = user.Id} );
    }
    
    // POST: api/admin/classes
    [HttpPost("classes")]
    public async Task<IActionResult> CreateClass([FromBody] CreateClassDto dto)
    {
        var newClass = new Class { Name = dto.Name, Description = dto.Description };
        _context.Classes.Add(newClass);
        await _context.SaveChangesAsync();
        return Ok(new { Message = "Class created successfully.", ClassId = newClass.Id });
    }
    
    // POST: api/admin/subjects
    [HttpPost("subjects")]
    public async Task<IActionResult> CreateSubject([FromBody] CreateSubjectDto dto)
    {
        var subject = new Subject { Name = dto.Name, Description = dto.Description };
        _context.Subjects.Add(subject);
        await _context.SaveChangesAsync();
        return Ok(new { Message = "Subject created successfully.", SubjectId = subject.Id });
    }
    // POST: api/admin/assign-teacher
    [HttpPost("assign-teacher")]
    public async Task<IActionResult> AssignTeacher([FromBody] AssignTeacherDto dto)
    {
        var teacher = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.TeacherId && u.Role == UserRole.Teacher);
        if (teacher == null) return NotFound(new { Message = "Teacher not found." });

        var duplicate = await _context.TeacherAssignments
            .AnyAsync(ta => ta.TeacherId == dto.TeacherId && ta.ClassId == dto.ClassId && ta.SubjectId == dto.SubjectId);
        
        if (duplicate) return BadRequest(new { Message = "Teacher is already assigned to this class and subject combination." });

        var assignment = new TeacherAssignment
        {
            TeacherId = dto.TeacherId,
            ClassId = dto.ClassId,
            SubjectId = dto.SubjectId
        };

        _context.TeacherAssignments.Add(assignment);
        await _context.SaveChangesAsync();
        return Ok(new { Message = "Teacher assigned successfully." });
    }
    // POST: api/admin/enroll-student
    [HttpPost("enroll-student")]
    public async Task<IActionResult> EnrollStudent([FromBody] EnrollStudentDto dto)
    {
        var student = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.StudentId && u.Role == UserRole.Student);
        if (student == null) return NotFound(new { Message = "Student not found." });

        var duplicate = await _context.StudentEnrollments
            .AnyAsync(se => se.StudentId == dto.StudentId && se.ClassId == dto.ClassId);
        
        if (duplicate) return BadRequest(new { Message = "Student is already enrolled in this class." });

        var enrollment = new StudentEnrollment
        {
            StudentId = dto.StudentId,
            ClassId = dto.ClassId
        };

        _context.StudentEnrollments.Add(enrollment);
        await _context.SaveChangesAsync();
        return Ok(new { Message = "Student enrolled successfully." });
    }
    
}