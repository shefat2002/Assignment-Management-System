namespace AssignmentSystem.Api.DTOs.Admin;

public class CreateSubjectDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int ClassId { get; set; }
    public string? Description { get; set; } = string.Empty;
}