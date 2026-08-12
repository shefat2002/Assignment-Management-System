using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Models.Enums;

namespace AssignmentSystem.Tests.Mocks;

public class MockDataFactory
{
    public static List<User> GetTestUsers()
    {
        return new List<User>
        {
            new User { Id = 1, FirstName = "System", LastName = "Admin", Email = "admin@test.com", Role = UserRole.Admin, PasswordHash = "hashed_password" },
            new User { Id = 2, FirstName = "John", LastName = "Teacher", Email = "teacher@test.com", Role = UserRole.Teacher, PasswordHash = "hashed_password" },
            new User { Id = 3, FirstName = "Jane", LastName = "Student", Email = "student@test.com", Role = UserRole.Student, PasswordHash = "hashed_password" }
        };
    }

    public static List<Class> GetTestClasses()
    {
        return new List<Class>
        {
            new Class { Id = 1, Name = "Class 10A", Description = "10th Grade Section A" },
            new Class { Id = 2, Name = "Class 11B", Description = "11th Grade Section B" }
        };
    }

    public static List<Subject> GetTestSubjects()
    {
        return new List<Subject>
        {
            new Subject { Id = 1, Name = "Mathematics", Description = "Algebra and Calculus" },
            new Subject { Id = 2, Name = "Physics", Description = "Mechanics and Thermodynamics" }
        };
    }

    public static List<TeacherAssignment> GetTestTeacherAssignments()
    {
        return new List<TeacherAssignment>
        {
            // Assigns Teacher (Id: 2) to Class 10A (Id: 1) for Mathematics (Id: 1)
            new TeacherAssignment { Id = 1, TeacherId = 2, ClassId = 1, SubjectId = 1 }
        };
    }

    public static List<StudentEnrollment> GetTestStudentEnrollments()
    {
        return new List<StudentEnrollment>
        {
            // Enrolls Student (Id: 3) in Class 10A (Id: 1)
            new StudentEnrollment { Id = 1, StudentId = 3, ClassId = 1 }
        };
    }

    public static List<Assignment> GetTestAssignments()
    {
        return new List<Assignment>
        {
            new Assignment 
            { 
                Id = 1, 
                Title = "Math Integration Homework", 
                Description = "Solve the problems attached.", 
                Deadline = DateTime.UtcNow.AddDays(7), 
                MaxMarks = 100, 
                AllowResubmission = true, 
                Status = AssignmentStatus.Published, 
                ClassId = 1, 
                SubjectId = 1, 
                TeacherId = 2 
            }
        };
    }
    
    public static List<Submission> GetTestSubmissions()
    {
        return new List<Submission>
        {
            new Submission
            {
                Id = 1, 
                AssignmentId = 1, 
                StudentId = 3, 
                Content = "Here is my final answer.",
                Status = SubmissionStatus.Submitted, 
                SubmittedAt = DateTime.UtcNow,
                Attachments = new List<SubmissionAttachment>()
            }
        };
    }
}