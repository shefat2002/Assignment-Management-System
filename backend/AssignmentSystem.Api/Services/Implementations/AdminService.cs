using AssignmentSystem.Api.DTOs.Admin;
using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Models.Enums;
using AssignmentSystem.Api.Repositories.Interfaces;
using AssignmentSystem.Api.Services.Interfaces;

namespace AssignmentSystem.Api.Services.Implementations;

public class AdminService : IAdminService
{
    private readonly IGenericRepository<User> _userRepository;
    private readonly IGenericRepository<Class> _classRepository;
    private readonly IGenericRepository<Subject> _subjectRepository;
    private readonly IGenericRepository<TeacherAssignment> _teacherAssignmentRepository;
    private readonly IGenericRepository<StudentEnrollment> _studentEnrollmentRepository;
    private readonly IGenericRepository<Assignment> _assignmentRepository;
    private readonly IGenericRepository<Submission> _submissionRepository;

    public AdminService(IGenericRepository<User> userRepository,
        IGenericRepository<Class> classRepository,
        IGenericRepository<Subject> subjectRepository,
        IGenericRepository<TeacherAssignment> teacherAssignmentRepository,
        IGenericRepository<StudentEnrollment> studentEnrollmentRepository,
        IGenericRepository<Assignment> assignmentRepository,
        IGenericRepository<Submission> submissionRepository)
    {
        _userRepository = userRepository;
        _classRepository = classRepository;
        _subjectRepository = subjectRepository;
        _teacherAssignmentRepository = teacherAssignmentRepository;
        _studentEnrollmentRepository = studentEnrollmentRepository;
        _assignmentRepository = assignmentRepository;
        _submissionRepository = submissionRepository;
    }
    
    // User 
    public async Task<IEnumerable<User>> GetAllUsersAsync() => await _userRepository.GetAllAsync();
    
    public async Task<(IEnumerable<User> Users, int TotalCount)> GetPagedUsersAsync(string role = null, string filterDate = null, string sortField = null, string sortOrder = null, int page = 1, int pageSize = 10)
    {
        var now = DateTime.UtcNow;
        UserRole? parsedRole = null;
        if (!string.IsNullOrEmpty(role) && role != "All")
        {
            if (Enum.TryParse<UserRole>(role, out var r))
                parsedRole = r;
        }

        return await _userRepository.GetPagedFilteredAndSortedAsync(
            filter: u => 
                (!parsedRole.HasValue || u.Role == parsedRole.Value) &&
                (string.IsNullOrEmpty(filterDate) || filterDate == "All" || 
                 (filterDate == "Today" && u.CreatedAt.Date == now.Date) ||
                 (filterDate == "This Week" && u.CreatedAt >= now.AddDays(-7)) ||
                 (filterDate == "This Month" && u.CreatedAt.Month == now.Month && u.CreatedAt.Year == now.Year) ||
                 (filterDate == "This Year" && u.CreatedAt.Year == now.Year)),
            orderBy: q =>
            {
                bool isDesc = sortOrder?.ToLower() == "desc";
                var field = sortField?.ToLower();
                return field switch
                {
                    "email" => isDesc ? q.OrderByDescending(x => x.Email) : q.OrderBy(x => x.Email),
                    "role" => isDesc ? q.OrderByDescending(x => x.Role) : q.OrderBy(x => x.Role),
                    "createdat" => isDesc ? q.OrderByDescending(x => x.CreatedAt) : q.OrderBy(x => x.CreatedAt),
                    _ => isDesc ? q.OrderByDescending(x => x.FirstName).ThenByDescending(x => x.LastName) : q.OrderBy(x => x.FirstName).ThenBy(x => x.LastName)
                };
            },
            page: page,
            pageSize: pageSize
        );
    }
    public async Task<User?> GetUserByIdAsync(int id) => await _userRepository.GetByIdAsync(id);

    public async Task<User> CreateUserAsync(CreateUserDto dto)
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
    
    public async Task UpdateUserAsync(int id, UpdateUserDto dto)
    {
        var user = await _userRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("User not found.");

        if (user.Email != dto.Email && await _userRepository.AnyAsync(u => u.Email == dto.Email))
            throw new InvalidOperationException("Email is already in use.");

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Email = dto.Email;
        user.Role = dto.Role;

        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync();
    }
    public async Task DeleteUserAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("User not found.");
        _userRepository.Delete(user);
        await _userRepository.SaveChangesAsync();
    }
    
    // Class
    public async Task<IEnumerable<Class>> GetAllClassesAsync() => await _classRepository.GetAllAsync();

    public async Task<Class?> GetClassByIdAsync(int id) => await _classRepository.GetByIdAsync(id);

    public async Task<Class> CreateClassAsync(CreateClassDto dto)
    {
        var newClass = new Class { Name = dto.Name, Description = dto.Description };
        await _classRepository.AddAsync(newClass);
        await _classRepository.SaveChangesAsync();
        return newClass;
    }

    public async Task UpdateClassAsync(int id, UpdateClassDto dto)
    {
        var classEntity = await _classRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Class not found.");
        classEntity.Name = dto.Name;
        classEntity.Description = dto.Description;

        _classRepository.Update(classEntity);
        await _classRepository.SaveChangesAsync();
    }

    public async Task DeleteClassAsync(int id)
    {
        var classEntity = await _classRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Class not found.");
        _classRepository.Delete(classEntity);
        await _classRepository.SaveChangesAsync();
    }
    
    // Subject
    public async Task<IEnumerable<Subject>> GetAllSubjectsAsync() => await _subjectRepository.GetAllAsync();

    public async Task<Subject?> GetSubjectByIdAsync(int id) => await _subjectRepository.GetByIdAsync(id);

    public async Task<Subject> CreateSubjectAsync(CreateSubjectDto dto)
    {
        var subject = new Subject { Name = dto.Name, Description = dto.Description };
        await _subjectRepository.AddAsync(subject);
        await _subjectRepository.SaveChangesAsync();
        return subject;
    }

    public async Task UpdateSubjectAsync(int id, UpdateSubjectDto dto)
    {
        var subject = await _subjectRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Subject not found.");
        subject.Name = dto.Name;
        subject.Description = dto.Description;

        _subjectRepository.Update(subject);
        await _subjectRepository.SaveChangesAsync();
    }

    public async Task DeleteSubjectAsync(int id)
    {
        var subject = await _subjectRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Subject not found.");
        _subjectRepository.Delete(subject);
        await _subjectRepository.SaveChangesAsync();
    }
    
    // Teacher assignment
    
    public async Task AssignTeacherAsync(AssignTeacherDto dto)
    {
        var teacher = await _userRepository.FirstOrDefaultAsync(u => u.Id == dto.TeacherId && u.Role == UserRole.Teacher) 
                      ?? throw new KeyNotFoundException("Teacher not found.");

        if (await _teacherAssignmentRepository.AnyAsync(ta => ta.TeacherId == dto.TeacherId && ta.ClassId == dto.ClassId && ta.SubjectId == dto.SubjectId))
            throw new InvalidOperationException("Teacher is already assigned to this class and subject combination.");

        var assignment = new TeacherAssignment
        {
            TeacherId = dto.TeacherId,
            ClassId = dto.ClassId,
            SubjectId = dto.SubjectId
        };

        await _teacherAssignmentRepository.AddAsync(assignment);
        await _teacherAssignmentRepository.SaveChangesAsync();
    }

    public async Task UnassignTeacherAsync(int id)
    {
        var assignment = await _teacherAssignmentRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Teacher assignment not found.");
        _teacherAssignmentRepository.Delete(assignment);
        await _teacherAssignmentRepository.SaveChangesAsync();
    }
    
    // Student Enrollment
    public async Task EnrollStudentAsync(EnrollStudentDto dto)
    {
        var student = await _userRepository.FirstOrDefaultAsync(u => u.Id == dto.StudentId && u.Role == UserRole.Student) 
                      ?? throw new KeyNotFoundException("Student not found.");

        if (await _studentEnrollmentRepository.AnyAsync(se => se.StudentId == dto.StudentId && se.ClassId == dto.ClassId))
            throw new InvalidOperationException("Student is already enrolled in this class.");

        var enrollment = new StudentEnrollment
        {
            StudentId = dto.StudentId,
            ClassId = dto.ClassId
        };

        await _studentEnrollmentRepository.AddAsync(enrollment);
        await _studentEnrollmentRepository.SaveChangesAsync();
    }

    public async Task UnenrollStudentAsync(int id)
    {
        var enrollment = await _studentEnrollmentRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Student enrollment not found.");
        _studentEnrollmentRepository.Delete(enrollment);
        await _studentEnrollmentRepository.SaveChangesAsync();
    }
    
    public async Task<IEnumerable<Assignment>> GetAllAssignmentsAsync()
    {
        return await _assignmentRepository.FindWithIncludesAsync(
            a => true, 
            a => a.Teacher!, 
            a => a.Class!, 
            a => a.Subject!
        );
    }

    public async Task<IEnumerable<Submission>> GetAllSubmissionsAsync()
    {
        return await _submissionRepository.FindWithIncludesAsync(
            s => true,
            s => s.Student!,
            s => s.Assignment!
        );
    }
    
    
}