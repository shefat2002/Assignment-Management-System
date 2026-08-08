using AssignmentSystem.Api.Models.Enitites;

namespace AssignmentSystem.Api.Models.Entities;

public class SubmissionAttachment
{
    public int Id { get; set; }
    public string OriginalFileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    
    public int SubmissionId { get; set; }
    public Submission? Submission { get; set; }
}