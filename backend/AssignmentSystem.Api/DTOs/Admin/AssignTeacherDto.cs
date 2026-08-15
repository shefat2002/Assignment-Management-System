namespace AssignmentSystem.Api.DTOs.Admin;

public class AssignTeacherDto
{
    public int TeacherId { get; set; }
    public int ClassId { get; set; }
    public int SubjectId { get; set; }
    public string Section { get; set; } = string.Empty;
}