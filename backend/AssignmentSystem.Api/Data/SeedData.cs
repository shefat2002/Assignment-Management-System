using AssignmentSystem.Api.Models.Entities;
using AssignmentSystem.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AssignmentSystem.Api.Data;

public static class SeedData
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Drop the existing data completely and recreate the schema via migrations
        await context.Database.EnsureDeletedAsync();
        await context.Database.MigrateAsync();

        // Load passwords from environment variables for security, fallback to defaults for local dev
        var adminPassword = Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD");
        var teacherPassword = Environment.GetEnvironmentVariable("SEED_TEACHER_PASSWORD") ;
        var studentPassword = Environment.GetEnvironmentVariable("SEED_STUDENT_PASSWORD") ;

        // === USERS ===
        var users = new List<User>();

        var adminUser = new User
        {
            FirstName = "System",
            LastName = "Admin",
            Email = "admin@school.edu.bd",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };
        users.Add(adminUser);

        // Teachers (10)
        string[] teacherFirstNames = { "Mohammad", "Fatema", "Abdul", "Ayesha", "Kamrul", "Nusrat", "Rafiqul", "Salma", "Tariqul", "Farhana" };
        string[] teacherLastNames = { "Rahman", "Begum", "Karim", "Siddiqua", "Hasan", "Jahan", "Islam", "Akter", "Haque", "Rahman" };

        var teachers = new List<User>();
        for (int i = 0; i < 10; i++)
        {
            var t = new User
            {
                FirstName = teacherFirstNames[i],
                LastName = teacherLastNames[i],
                Email = $"teacher{i+1}@school.edu.bd",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(teacherPassword),
                Role = UserRole.Teacher,
                CreatedAt = DateTime.UtcNow
            };
            teachers.Add(t);
            users.Add(t);
        }

        // Students (30)
        string[] studentFirstNames = { "Rakib", "Sumaiya", "Mehedi", "Jannatul", "Tamim", "Sadia", "Shakil", "Nusrat", "Nazmul", "Riya", "Naimur", "Tasnim", "Sabbir", "Anika", "Mahmudul", "Fahmida", "Ariful", "Sanjida", "Mominul", "Tanjila", "Sajjad", "Farjana", "Emon", "Mim", "Al", "Ritu", "Ashraful", "Nipa", "Shahriar", "Jui" };
        string[] studentLastNames = { "Hossain", "Akter", "Hasan", "Ferdous", "Iqbal", "Afrin", "Ahmed", "Faria", "Huda", "Moni", "Rahman", "Tabassum", "Hossain", "Tabassum", "Hasan", "Rahman", "Islam", "Akter", "Haque", "Islam", "Hossain", "Boby", "Ahmed", "Akter", "Amin", "Parna", "Islam", "Rani", "Nafees", "Khatun" };

        var students = new List<User>();
        for (int i = 0; i < 30; i++)
        {
            var s = new User
            {
                FirstName = studentFirstNames[i],
                LastName = studentLastNames[i],
                Email = $"student{i+1}@school.edu.bd",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(studentPassword),
                Role = UserRole.Student,
                CreatedAt = DateTime.UtcNow
            };
            students.Add(s);
            users.Add(s);
        }

        await context.Users.AddRangeAsync(users);
        await context.SaveChangesAsync();

        // === CLASSES ===
        var classes = new List<Class>();
        int year = 2026;
        int[] classGrades = { 6, 7, 8 };

        foreach (var grade in classGrades)
        {
            classes.Add(new Class
            {
                Name = $"Class {grade}",
                NumberOfSections = 2,
                Year = year,
                Description = $"Secondary Education - Class {grade}"
            });
        }

        await context.Classes.AddRangeAsync(classes);
        await context.SaveChangesAsync();

        // === STUDENT ENROLLMENTS ===
        var enrollments = new List<StudentEnrollment>();
        int studentIndex = 0;
        string[] sections = { "A", "B" };

        foreach (var cls in classes)
        {
            foreach (var sec in sections)
            {
                for (int i = 0; i < 5; i++) // 5 students per section (Total 10 per class * 3 classes = 30 students)
                {
                    if (studentIndex < students.Count)
                    {
                        enrollments.Add(new StudentEnrollment
                        {
                            StudentId = students[studentIndex].Id,
                            ClassId = cls.Id,
                            Section = sec
                        });
                        studentIndex++;
                    }
                }
            }
        }
        await context.StudentEnrollments.AddRangeAsync(enrollments);
        await context.SaveChangesAsync();

        // === SUBJECTS ===
        string[] subjectNames = { "Bangla", "English", "Mathematics", "Science", "Bangladesh and Global Studies", "Religion and Moral Education", "ICT" };
        var subjects = new List<Subject>();

        foreach (var cls in classes)
        {
            foreach (var subj in subjectNames)
            {
                // Generate a short code, e.g. BAN6
                string codePrefix = subj.Length >= 3 ? subj.Substring(0, 3).ToUpper() : subj.ToUpper();
                if (subj.Contains("Bangladesh and Global Studies")) codePrefix = "BGS";
                if (subj.Contains("Religion and Moral Education")) codePrefix = "RME";

                subjects.Add(new Subject
                {
                    Name = subj,
                    Code = $"{codePrefix}{cls.Name.Replace("Class ", "")}",
                    ClassId = cls.Id,
                    Description = $"{subj} for {cls.Name}"
                });
            }
        }
        await context.Subjects.AddRangeAsync(subjects);
        await context.SaveChangesAsync();

        // === TEACHER ASSIGNMENTS ===
        var teacherAssignments = new List<TeacherAssignment>();
        int tIndex = 0;
        foreach (var sub in subjects)
        {
            // Assign a teacher to Section A
            teacherAssignments.Add(new TeacherAssignment
            {
                TeacherId = teachers[tIndex % teachers.Count].Id,
                ClassId = sub.ClassId,
                SubjectId = sub.Id,
                Section = "A"
            });
            tIndex++;
            // Assign another teacher to Section B
            teacherAssignments.Add(new TeacherAssignment
            {
                TeacherId = teachers[tIndex % teachers.Count].Id,
                ClassId = sub.ClassId,
                SubjectId = sub.Id,
                Section = "B"
            });
            tIndex++;
        }
        await context.TeacherAssignments.AddRangeAsync(teacherAssignments);
        await context.SaveChangesAsync();

        // === ASSIGNMENTS ===
        var assignments = new List<Assignment>();
        var random = new Random(123); // fixed seed for reproducibility

        for (int i = 0; i < 20; i++)
        {
            var tAssign = teacherAssignments[random.Next(teacherAssignments.Count)];
            var subject = subjects.FirstOrDefault(s => s.Id == tAssign.SubjectId);
            
            assignments.Add(new Assignment
            {
                Title = $"Assignment {i + 1} - {subject?.Name ?? "General"}",
                Description = $"Please complete the assignment for {subject?.Name ?? "the subject"}. Ensure to follow all instructions.",
                Deadline = DateTime.UtcNow.AddDays(random.Next(-5, 15)), // Some past, some future
                MaxMarks = 100,
                Status = AssignmentStatus.Published,
                AllowResubmission = random.Next(2) == 0,
                TeacherId = tAssign.TeacherId,
                ClassId = tAssign.ClassId,
                SubjectId = tAssign.SubjectId,
                Section = tAssign.Section
            });
        }
        await context.Assignments.AddRangeAsync(assignments);
        await context.SaveChangesAsync();

        // === SUBMISSIONS ===
        var submissions = new List<Submission>();
        foreach (var assignment in assignments)
        {
            // Find students in the same class and section
            var enrolledStudents = enrollments
                .Where(e => e.ClassId == assignment.ClassId && e.Section == assignment.Section)
                .Select(e => e.StudentId)
                .ToList();

            // Submit for a subset of students (e.g., up to 3)
            int numSubmissions = random.Next(1, Math.Min(4, enrolledStudents.Count + 1));
            for (int j = 0; j < numSubmissions; j++)
            {
                var studentId = enrolledStudents[j];
                bool isPastDeadline = assignment.Deadline < DateTime.UtcNow;
                bool isGraded = isPastDeadline && random.Next(2) == 0;
                
                var submission = new Submission
                {
                    AssignmentId = assignment.Id,
                    StudentId = studentId,
                    Content = $"This is the submission content for assignment {assignment.Id} by student {studentId}.",
                    SubmittedAt = assignment.Deadline.AddDays(-random.Next(1, 4)),
                    Status = isGraded ? SubmissionStatus.Graded : SubmissionStatus.Submitted,
                    MarksAwarded = isGraded ? (decimal?)random.Next(60, 101) : null,
                    Feedback = isGraded ? "Good effort and well explained." : null
                };
                submissions.Add(submission);
            }
        }
        
        await context.Submissions.AddRangeAsync(submissions);
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
