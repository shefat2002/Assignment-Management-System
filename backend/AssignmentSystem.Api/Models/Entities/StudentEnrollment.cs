namespace AssignmentSystem.Api.Models.Enitites;

public class StudentEnrollment
{
    public int Id { get; set; }
        
    public int StudentId { get; set; }
    public User? Student { get; set; }
        
    public int ClassId { get; set; }
    public Class? Class { get; set; }
}