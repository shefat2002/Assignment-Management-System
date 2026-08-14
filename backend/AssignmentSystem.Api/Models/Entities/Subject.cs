namespace AssignmentSystem.Api.Models.Entities;

public class Subject
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }  = string.Empty;

    public int ClassId { get; set; }
    public Class? Class { get; set; }
}