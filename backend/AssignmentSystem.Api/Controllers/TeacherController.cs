using AssignmentSystem.Api.Data;
using AssignmentSystem.Api.DTOs.Teacher;
using Microsoft.AspNetCore.Mvc;

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
        return Ok();
    }
}