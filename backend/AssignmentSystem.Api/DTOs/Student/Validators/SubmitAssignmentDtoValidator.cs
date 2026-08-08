using FluentValidation;

namespace AssignmentSystem.Api.DTOs.Student.Validators;

public class SubmitAssignmentDtoValidator: AbstractValidator<SubmitAssignmentDto>
{
    public  SubmitAssignmentDtoValidator()
    {
        RuleFor(x => x)
            .Must(x=> !string.IsNullOrWhiteSpace(x.Content) || (x.Files != null && x.Files.Count > 0))
            .WithMessage("Either content or at least one file must be provided.");
        
        RuleFor(x => x.Files)
            .Must(files => files != null && files.Count <= 10)
            .WithMessage("You can upload a maximum of 10 files.");
        RuleForEach(x=> x.Files).ChildRules(file =>
        {
            file.RuleFor(f => f.Length)
                .LessThanOrEqualTo(10 * 1024 * 1024) // 10 MB
                .WithMessage("Each file must be less than or equal to 10 MB.");
            file.RuleFor(f => f.FileName)
                .Must(BeAValidExtension)
                .WithMessage("Invalid file type. Allowed: pdf, docx, txt, md, jpg, jpeg, png.");
        });
    }
    private bool BeAValidExtension(string fileName)
    {
        var allowedExtensions = new[] {".pdf", ".docx", ".txt", ".md", ".jpg", ".jpeg", ".png"};
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return allowedExtensions.Contains(extension);
    }
}