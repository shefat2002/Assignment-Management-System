using AssignmentSystem.Api.Models.Enums;

namespace AssignmentSystem.Api.Models.Entities;

public class Submission
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public decimal? MarksAwarded { get; set; }
    public string? Feedback { get; set; }
    public SubmissionStatus Status { get; set; } = SubmissionStatus.Submitted;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public int AssignmentId { get; set; }
    public Assignment? Assignment { get; set; }

    public int StudentId { get; set; }
    public User? Student { get; set; }
    public ICollection<SubmissionAttachment> Attachments { get; set; } = new List<SubmissionAttachment>();
}