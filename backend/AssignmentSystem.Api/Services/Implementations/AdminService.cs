using AssignmentSystem.Api.DTOs.Admin;
using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Repositories.Interfaces;
using AssignmentSystem.Api.Services.Interfaces;

namespace AssignmentSystem.Api.Services.Implementations;

public class AdminService : IAdminService
{
    private readonly IGenericRepository<User> _userRepository;
    private readonly IGenericRepository<Class> _classRepository;
    private readonly IGenericRepository<Subject> _subjectRepository;
    private readonly IGenericRepository<TeacherAssignment> _assignmentRepository;
    private readonly IGenericRepository<StudentEnrollment> _enrollmentRepository;

    public AdminService(
        IGenericRepository<User> userRepository,
        IGenericRepository<Class> classRepository,
        IGenericRepository<Subject> subjectRepository,
        IGenericRepository<TeacherAssignment> assignmentRepository,
        IGenericRepository<StudentEnrollment> enrollmentRepository)
    {
        _userRepository = userRepository;
        _classRepository = classRepository;
        _subjectRepository = subjectRepository;
        _assignmentRepository = assignmentRepository;
        _enrollmentRepository = enrollmentRepository;
    }
    
    // User 
    public async Task<IEnumerable<User>> GetAllUsersAsync() => await _userRepository.GetAllAsync();
    public async Task<User?> GetUserByIdAsync(int id) => await _userRepository.GetByIdAsync(id);

    public async Task<User?> CreateUserAsync(CreateUserDto dto)
    {
        if (await _userRepository.AnyAsync(u => u.Email == dto.Email))
            throw new InvalidOperationException("Email is already in use.");

        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Role = dto.Role,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();
        return user;
    }
    
}