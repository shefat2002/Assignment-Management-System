namespace AssignmentSystem.Api.DTOs.Student;

public class SubmitAssignmentDto
{
    public string? Content { get; set; } = string.Empty;
    public List<IFormFile>? Files { get; set; } = new List<IFormFile>();
}