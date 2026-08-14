using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSystem.Api.Data;

public static class SeedData
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Ensure database is created
        await context.Database.EnsureCreatedAsync();

        // Clear existing data for clean seed (optional - remove if you want to preserve data)
        if (await context.Users.AnyAsync())
        {
            return; // Database already seeded
        }

        // === USERS ===
        var adminUser = new User
        {
            FirstName = "Admin",
            LastName = "User",
            Email = "admin@demo.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };

        var teacher1 = new User
        {
            FirstName = "John",
            LastName = "Teacher",
            Email = "teacher1@demo.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Teacher123!"),
            Role = UserRole.Teacher,
            CreatedAt = DateTime.UtcNow
        };

        var teacher2 = new User
        {
            FirstName = "Jane",
            LastName = "Instructor",
            Email = "teacher2@demo.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Teacher123!"),
            Role = UserRole.Teacher,
            CreatedAt = DateTime.UtcNow
        };

        var student1 = new User
        {
            FirstName = "Alice",
            LastName = "Student",
            Email = "student1@demo.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student123!"),
            Role = UserRole.Student,
            CreatedAt = DateTime.UtcNow
        };

        var student2 = new User
        {
            FirstName = "Bob",
            LastName = "Learner",
            Email = "student2@demo.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student123!"),
            Role = UserRole.Student,
            CreatedAt = DateTime.UtcNow
        };

        var student3 = new User
        {
            FirstName = "Charlie",
            LastName = "Brown",
            Email = "student3@demo.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student123!"),
            Role = UserRole.Student,
            CreatedAt = DateTime.UtcNow
        };

        await context.Users.AddRangeAsync(adminUser, teacher1, teacher2, student1, student2, student3);
        await context.SaveChangesAsync();

        // === CLASSES ===
        var class10 = new Class { Name = "Class 10", Section = "A", Year = DateTime.UtcNow.Year, Description = "Secondary Education - Year 10" };
        var class12 = new Class { Name = "Class 12", Section = "A", Year = DateTime.UtcNow.Year, Description = "Higher Secondary - Year 12" };

        await context.Classes.AddRangeAsync(class10, class12);
        await context.SaveChangesAsync();

        // === SUBJECTS ===
        var math = new Subject { Name = "Mathematics", Code = "MATH101", ClassId = class10.Id, Description = "Advanced Mathematics" };
        var physics = new Subject { Name = "Physics", Code = "PHYS101", ClassId = class12.Id, Description = "Classical and Modern Physics" };
        var chemistry = new Subject { Name = "Chemistry", Code = "CHEM101", ClassId = class10.Id, Description = "Organic and Inorganic Chemistry" };
        var english = new Subject { Name = "English", Code = "ENG101", ClassId = class12.Id, Description = "English Literature and Language" };
        var cs = new Subject { Name = "Computer Science", Code = "CS101", ClassId = class10.Id, Description = "Programming and Algorithms" };

        await context.Subjects.AddRangeAsync(math, physics, chemistry, english, cs);
        await context.SaveChangesAsync();

        // === TEACHER ASSIGNMENTS ===
        await context.TeacherAssignments.AddRangeAsync(
            new TeacherAssignment { TeacherId = teacher1.Id, ClassId = class10.Id, SubjectId = math.Id },
            new TeacherAssignment { TeacherId = teacher1.Id, ClassId = class12.Id, SubjectId = physics.Id },
            new TeacherAssignment { TeacherId = teacher2.Id, ClassId = class10.Id, SubjectId = chemistry.Id },
            new TeacherAssignment { TeacherId = teacher2.Id, ClassId = class12.Id, SubjectId = english.Id }
        );
        await context.SaveChangesAsync();

        // === STUDENT ENROLLMENTS ===
        await context.StudentEnrollments.AddRangeAsync(
            new StudentEnrollment { StudentId = student1.Id, ClassId = class10.Id },
            new StudentEnrollment { StudentId = student2.Id, ClassId = class10.Id },
            new StudentEnrollment { StudentId = student3.Id, ClassId = class12.Id }
        );
        await context.SaveChangesAsync();

        // === ASSIGNMENTS ===
        var mathAssignment = new Assignment
        {
            Title = "Quadratic Equations Problem Set",
            Description = "Solve the following quadratic equations and show your work. Must include factoring and quadratic formula methods.",
            ClassId = class10.Id,
            SubjectId = math.Id,
            TeacherId = teacher1.Id,
            Deadline = DateTime.UtcNow.AddDays(7),
            MaxMarks = 100,
            Status = AssignmentStatus.Published,
            AllowResubmission = true,
            CreatedAt = DateTime.UtcNow
        };

        var physicsAssignment = new Assignment
        {
            Title = "Newton's Laws Lab Report",
            Description = "Write a detailed lab report on the experiment verifying Newton's Second Law of Motion.",
            ClassId = class12.Id,
            SubjectId = physics.Id,
            TeacherId = teacher1.Id,
            Deadline = DateTime.UtcNow.AddDays(14),
            MaxMarks = 50,
            Status = AssignmentStatus.Published,
            AllowResubmission = false,
            CreatedAt = DateTime.UtcNow
        };

        var chemistryAssignment = new Assignment
        {
            Title = "Organic Compounds Worksheet",
            Description = "Identify and name the organic compounds shown in the attached worksheet. Include IUPAC names.",
            ClassId = class10.Id,
            SubjectId = chemistry.Id,
            TeacherId = teacher2.Id,
            Deadline = DateTime.UtcNow.AddDays(5),
            MaxMarks = 75,
            Status = AssignmentStatus.Published,
            AllowResubmission = true,
            CreatedAt = DateTime.UtcNow
        };

        await context.Assignments.AddRangeAsync(mathAssignment, physicsAssignment, chemistryAssignment);
        await context.SaveChangesAsync();

        // === SUBMISSIONS (Sample) ===
        await context.Submissions.AddRangeAsync(
            new Submission
            {
                AssignmentId = mathAssignment.Id,
                StudentId = student1.Id,
                Content = "I solved all 10 problems. Used factoring for 1-5 and quadratic formula for 6-10. Answers are: x=3, x=-2, etc.",
                SubmittedAt = DateTime.UtcNow.AddHours(-2),
                MarksAwarded = null,
                Feedback = null,
                Status = SubmissionStatus.Submitted
            }
        );
        await context.SaveChangesAsync();

        // === APP SETTINGS ===
        await context.AppSettings.AddRangeAsync(
            new AppSetting
            {
                SettingKey = "MaxFileSizeMB",
                SettingValue = "100",
                Description = "Maximum file upload size in megabytes"
            },
            new AppSetting
            {
                SettingKey = "AllowLateSubmissions",
                SettingValue = "true",
                Description = "Allow students to submit assignments after deadline"
            },
            new AppSetting
            {
                SettingKey = "DefaultResubmissionAllowed",
                SettingValue = "true",
                Description = "Default setting for allowing resubmissions"
            }
        );
        await context.SaveChangesAsync();
    }
}
