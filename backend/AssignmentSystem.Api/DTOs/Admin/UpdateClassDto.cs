namespace AssignmentSystem.Api.DTOs.Admin;

public class UpdateClassDto
{
    public string Name { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public int Year { get; set; }
    public string? Description { get; set; }
}