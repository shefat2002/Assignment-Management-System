using FluentValidation;

namespace AssignmentSystem.Api.DTOs.Auth.Validators;

public class LoginValidator: AbstractValidator<LoginDto>
{
    public LoginValidator()
    {
        RuleFor(user => user.Email)
            .NotEmpty()
            .EmailAddress()
            .WithMessage("Email is required");

        RuleFor(user => user.Password)
            .NotEmpty()
            .MinimumLength(6)
            .MaximumLength(100)
            .WithMessage("Password is required");
    }
    
}