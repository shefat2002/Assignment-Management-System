namespace AssignmentSystem.Api.Models.Entities;

public class Class
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int NumberOfSections { get; set; } = 1;
    public int Year { get; set; }
    public string? Description { get; set; } = string.Empty;
}