using AssignmentSystem.Api.Models.Enitites;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSystem.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    
    public DbSet<User> Users { get; set; }
    public DbSet<Subject> Subjects { get; set; }
    public DbSet<Class> Classes { get; set; }
    public DbSet<StudentEnrollment> StudentEnrollments { get; set; }
    public DbSet<Assignment> Assignments { get; set; }
    public DbSet<TeacherAssignment> TeacherAssignments { get; set; }
    public DbSet<Submission> Submissions { get; set; }
    public DbSet<AppSetting> AppSettings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<AppSetting>().HasKey(a => a.SettingKey);
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(u => u.FirstName).IsRequired().HasMaxLength(50);
            entity.Property(u => u.LastName).IsRequired().HasMaxLength(50);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(50);

            entity.HasIndex(u => u.Email).IsUnique();
        });
        
        modelBuilder.Entity<Class>().Property(c => c.Name).IsRequired().HasMaxLength(100);
        modelBuilder.Entity<Subject>().Property(s => s.Name).IsRequired().HasMaxLength(100);
        
        modelBuilder.Entity<StudentEnrollment>()
            .HasOne(se => se.Student)
            .WithMany()
            .HasForeignKey(se => se.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TeacherAssignment>(entity =>
        {
            entity.HasOne(te => te.Teacher)
                .WithMany()
                .HasForeignKey(te => te.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // note: A teacher cannot be assigned to the exact same class and subject twice
            entity.HasIndex(te => new { te.TeacherId, te.ClassId, te.SubjectId }).IsUnique();
        });
        
        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.Property(a => a.Title).IsRequired().HasMaxLength(200);
            entity.Property(a => a.MaxMarks).HasColumnType("decimal(5, 2)");
            entity.HasOne(a => a.Teacher)
                .WithMany()
                .HasForeignKey(a => a.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<Submission>(entity =>
        {
            entity.Property(s => s.Content).IsRequired();
            entity.Property(s => s.MarksAwarded).HasColumnType("decimal(5, 2)");

            entity.HasOne(s => s.Student)
                .WithMany()
                .HasForeignKey(s => s.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

    }
    
    
}