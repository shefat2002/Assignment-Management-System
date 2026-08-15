namespace AssignmentSystem.Api.DTOs.Teacher;

public class CreateAssignmentDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public decimal TotalMarks { get; set; }
    public bool AllowResubmission { get; set; }
    public int ClassId { get; set; }
    public int SubjectId { get; set; }
    public string Section { get; set; } = string.Empty;
    
}