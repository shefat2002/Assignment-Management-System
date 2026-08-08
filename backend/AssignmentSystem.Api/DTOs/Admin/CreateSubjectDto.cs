namespace AssignmentSystem.Api.DTOs.Admin;

public class CreateSubjectDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; } = string.Empty;
}