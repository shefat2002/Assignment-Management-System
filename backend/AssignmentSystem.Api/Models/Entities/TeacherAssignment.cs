using AssignmentSystem.Api.Models.Enitites;

namespace AssignmentSystem.Api.Models.Entities;

public class TeacherAssignment
{
    public int Id { get; set; }
        
    public int TeacherId { get; set; }
    public User? Teacher { get; set; }
        
    public int ClassId { get; set; }
    public Class? Class { get; set; }
        
    public int SubjectId { get; set; }
    public Subject? Subject { get; set; }
}