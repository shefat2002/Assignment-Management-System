using FluentValidation;

namespace AssignmentSystem.Api.DTOs.Teacher.Validators;

public class GradeSubmissionDtoValidator : AbstractValidator<GradeSubmissionDto>
{
    public GradeSubmissionDtoValidator()
    {
        RuleFor(x => x.MarksAwarded)
            .GreaterThanOrEqualTo(0).WithMessage("Marks can't be negative");
    }
}