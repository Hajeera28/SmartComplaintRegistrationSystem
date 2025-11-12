using System.ComponentModel.DataAnnotations;
using SmartComplaint.Models.Enums;

namespace SmartComplaint.DTOs
{
    public class AuthenticationDto
    {
        public class UserLoginDto
        {
            [Required(ErrorMessage = "Email is required.")]
            [EmailAddress]
            public string Email { get; set; }

            [Required(ErrorMessage = "Password is required.")]
            public string Password { get; set; }
        }

        public class CitizenRegistrationDto
        {
            [Required(ErrorMessage = "Name is required.")]
            [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters.")]
            [RegularExpression(@"^[a-zA-Z\s]+$", ErrorMessage = "Name can only contain letters and spaces.")]
            public string Name { get; set; }

            [Required(ErrorMessage = "Email is required.")]
            [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
            [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters.")]
            public string Email { get; set; }

            [Required(ErrorMessage = "Password is required.")]
            [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be between 8 and 100 characters.")]
            [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, and one number.")]
            public string Password { get; set; }

            [Required(ErrorMessage = "Phone number is required.")]
            [RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Please enter a valid 10-digit Indian mobile number starting with 6-9.")]
            public string Phone { get; set; }

            [Required(ErrorMessage = "Address is required.")]
            [StringLength(500, MinimumLength = 10, ErrorMessage = "Address must be between 10 and 500 characters.")]
            public string Address { get; set; }

            [Required(ErrorMessage = "State is required.")]
            [StringLength(50, MinimumLength = 2, ErrorMessage = "State must be between 2 and 50 characters.")]
            public string State { get; set; }
        }

        public class OfficerRegistrationDto
        {
            [Required(ErrorMessage = "Name is required.")]
            [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters.")]
            [RegularExpression(@"^[a-zA-Z\s]+$", ErrorMessage = "Name can only contain letters and spaces.")]
            public string Name { get; set; }

            [Required(ErrorMessage = "Email is required.")]
            [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
            [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters.")]
            public string Email { get; set; }

            [Required(ErrorMessage = "Password is required.")]
            [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be between 8 and 100 characters.")]
            [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, and one number.")]
            public string Password { get; set; }

            [Required(ErrorMessage = "Officer role is required.")]
            [Range(1, 5, ErrorMessage = "Please select a valid officer role.")]
            public OfficerRole Role { get; set; }

            [Required(ErrorMessage = "Department ID is required.")]
            [Range(1, int.MaxValue, ErrorMessage = "Please select a valid department.")]
            public int DepartmentId { get; set; }

            [Required(ErrorMessage = "State is required.")]
            [StringLength(50, MinimumLength = 2, ErrorMessage = "State must be between 2 and 50 characters.")]
            public string State { get; set; }
        }

        public class AuthResponseDto
        {
            public string Message { get; set; }
            public UserDto.UserReadDto User { get; set; }
            public object Profile { get; set; }
        }
    }
}