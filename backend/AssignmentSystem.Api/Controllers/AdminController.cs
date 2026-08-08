using AssignmentSystem.Api.Data;
using AssignmentSystem.Api.DTOs.Admin;
using AssignmentSystem.Api.Models.Enitites;
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
    
}