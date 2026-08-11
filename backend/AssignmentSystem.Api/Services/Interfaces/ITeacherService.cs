using AssignmentSystem.Api.DTOs.Teacher;
using AssignmentSystem.Api.Models.Entities;

namespace AssignmentSystem.Api.Services.Interfaces;

public interface ITeacherService
{
    Task<Assignment> CreateAssignmentAsync(int teacherId, CreateAssignmentDto dto);
    Task<Assignment?> GetAssignmentByIdAsync(int id);
}