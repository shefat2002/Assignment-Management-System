using AssignmentSystem.Api.DTOs.Teacher;
using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Models.Enums;
using AssignmentSystem.Api.Repositories.Interfaces;
using AssignmentSystem.Api.Services.Interfaces;

namespace AssignmentSystem.Api.Services.Implementations;

public class TeacherService : ITeacherService
{
    private readonly IGenericRepository<Assignment> _assignmentRepository;
    private readonly IGenericRepository<TeacherAssignment> _teacherAssignmentRepository;

    public TeacherService(IGenericRepository<Assignment> assignmentRepository, IGenericRepository<TeacherAssignment> teacherAssignmentRepository)
    {
        _assignmentRepository = assignmentRepository;
        _teacherAssignmentRepository = teacherAssignmentRepository;
    }
    
    public async Task<Assignment> CreateAssignmentAsync(int teacherId, CreateAssignmentDto dto)
    {
        var isAuthorized = await _teacherAssignmentRepository.AnyAsync(ta => 
            ta.TeacherId == teacherId && ta.ClassId == dto.ClassId && ta.SubjectId == dto.SubjectId);

        if (!isAuthorized)
            throw new UnauthorizedAccessException("You are not authorized to create assignments for this class and subject.");

        var newAssignment = new Assignment
        {
            Title = dto.Title,
            Description = dto.Description,
            Deadline = dto.DueDate,
            MaxMarks = dto.TotalMarks,
            AllowResubmission = dto.AllowResubmission,
            ClassId = dto.ClassId,
            SubjectId = dto.SubjectId,
            TeacherId = teacherId,
            Status = AssignmentStatus.Draft
        };

        await _assignmentRepository.AddAsync(newAssignment);
        await _assignmentRepository.SaveChangesAsync();
        return newAssignment;
    }

    public async Task<Assignment?> GetAssignmentByIdAsync(int id)
    {
        // Using our new Generic Repository feature!
        return await _assignmentRepository.FirstOrDefaultWithIncludesAsync(
            a => a.Id == id, 
            a => a.Class!, 
            a => a.Subject!);
    }
}