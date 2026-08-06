namespace AssignmentSystem.Api.DTOs.Teacher;

public class GradeSubmissionDto
{
    public decimal MarksAwarded { get; set; }
    public string? Feedback { get; set; } = string.Empty;
}