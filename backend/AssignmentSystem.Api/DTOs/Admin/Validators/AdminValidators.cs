using FluentValidation;

namespace AssignmentSystem.Api.DTOs.Admin.Validators;

public class CreateUserDtoValidator : AbstractValidator<CreateUserDto>
{
    public CreateUserDtoValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50).WithMessage("First name is required and should not exceed 50 characters.");
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(50).WithMessage("Last name is required and should not exceed 50 characters.");
        RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("A valid email is required.");
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6).WithMessage("Password must be at least 6 characters long.");
        RuleFor(x => x.Role).IsInEnum().WithMessage("Role is invalid. Must be one of the following: Admin, Teacher, Student");
    }
}

public class CreateClassDtoValidator : AbstractValidator<CreateClassDto>
{
    public CreateClassDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100).WithMessage("Class name is required and should not exceed 100 characters.");
    }
}

public class CreateSubjectDtoValidator : AbstractValidator<CreateSubjectDto>
{
    public CreateSubjectDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100).WithMessage("Subject name is required and should not exceed 100 characters.");
    }
}

public class AssignTeacherDtoValidator : AbstractValidator<AssignTeacherDto>
{
    public AssignTeacherDtoValidator()
    {
        RuleFor(x => x.TeacherId).GreaterThan(0).WithMessage("Teacher ID is required");
        RuleFor(x => x.ClassId).GreaterThan(0).WithMessage("Class ID is required");
        RuleFor(x => x.SubjectId).GreaterThan(0).WithMessage("Subject ID is required");
    }
}

public class EnrollStudentDtoValidator : AbstractValidator<EnrollStudentDto>
{
    public EnrollStudentDtoValidator()
    {
        RuleFor(x => x.StudentId).GreaterThan(0).WithMessage("Student ID is required");
        RuleFor(x => x.ClassId).GreaterThan(0).WithMessage("Class ID is required");
    }
}