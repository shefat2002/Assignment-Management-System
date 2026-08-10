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
}