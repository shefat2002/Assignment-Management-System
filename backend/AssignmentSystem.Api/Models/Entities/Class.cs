namespace AssignmentSystem.Api.Models.Entities;

public class Class
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public int Year { get; set; }
    public string? Description { get; set; } = string.Empty;
}