using AssignmentSystem.Api.Models.Enums;

namespace AssignmentSystem.Api.DTOs.Teacher;

public class UpdateAssignmentDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public decimal TotalMarks { get; set; }
    public bool AllowResubmission { get; set; }
    public AssignmentStatus Status { get; set; }
}