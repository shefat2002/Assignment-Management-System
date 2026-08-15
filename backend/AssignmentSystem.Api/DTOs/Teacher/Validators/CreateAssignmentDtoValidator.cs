using FluentValidation;

namespace AssignmentSystem.Api.DTOs.Teacher.Validators;

public class CreateAssignmentDtoValidator: AbstractValidator<CreateAssignmentDto>
{
    public  CreateAssignmentDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(100).WithMessage("Title can't be longer than 100 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MaximumLength(4000).WithMessage("Description can't be longer than 4000 characters");

        RuleFor(x => x.DueDate)
            .GreaterThan(DateTime.Now).WithMessage("Due date must be in the future");

        RuleFor(x => x.TotalMarks)
            .GreaterThan(0).WithMessage("Total marks must be greater than 0");

        RuleFor(x => x.ClassId)
            .GreaterThan(0).WithMessage("A valid class id is required");

        RuleFor(x => x.SubjectId)
            .GreaterThan(0).WithMessage("A valid subject id is required");

        RuleFor(x => x.Section)
            .NotEmpty().WithMessage("Section is required");
    }
}