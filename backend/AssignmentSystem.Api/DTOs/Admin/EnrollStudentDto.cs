namespace AssignmentSystem.Api.DTOs.Admin;

public class EnrollStudentDto
{
    public int StudentId { get; set; }
    public int ClassId { get; set; }
    public string Section { get; set; } = string.Empty;
}