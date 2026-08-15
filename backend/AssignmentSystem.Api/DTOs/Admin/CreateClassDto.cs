namespace AssignmentSystem.Api.DTOs.Admin;

public class CreateClassDto
{
    public string Name { get; set; } =  string.Empty;
    public int NumberOfSections { get; set; } = 1;
    public int Year { get; set; }
    public string? Description { get; set; } =  string.Empty;
}