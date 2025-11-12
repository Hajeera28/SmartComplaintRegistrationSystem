using System.ComponentModel.DataAnnotations;
using SmartComplaint.Models.Enums;

namespace SmartComplaint.DTOs
{
    public class UserDto
    {
        public class UserCreateDto
        {
            [Required(ErrorMessage = "Username is required.")]
            [StringLength(100, MinimumLength = 3)]
            public string Username { get; set; }

            [Required(ErrorMessage = "Email is required.")]
            [EmailAddress(ErrorMessage = "Invalid email format.")]
            [StringLength(100)]
            public string Email { get; set; }

            [Required(ErrorMessage = "Password is required.")]
            [StringLength(255, MinimumLength = 6)]
            public string Password { get; set; }

            [Required(ErrorMessage = "Role is required.")]
            public UserRole Role { get; set; }
        }

        public class UserUpdateDto
        {
            [Required]
            public int UserId { get; set; }

            [Required(ErrorMessage = "Username is required.")]
            [StringLength(100, MinimumLength = 3)]
            public string Username { get; set; }

            [Required(ErrorMessage = "Email is required.")]
            [EmailAddress(ErrorMessage = "Invalid email format.")]
            [StringLength(100)]
            public string Email { get; set; }

            [Required(ErrorMessage = "Role is required.")]
            public UserRole Role { get; set; }
        }

        public class UserReadDto
        {
            public int UserId { get; set; }
            public string Username { get; set; }
            public string Email { get; set; }
            public string Role { get; set; }
            public bool IsActive { get; set; }
        }

        public class LoginDto
        {
            [Required(ErrorMessage = "Email is required.")]
            [EmailAddress]
            public string Email { get; set; }

            [Required(ErrorMessage = "Password is required.")]
            public string Password { get; set; }
        }

        public class CitizenRegisterDto
        {
            [Required(ErrorMessage = "Name is required.")]
            [StringLength(100)]
            public string Name { get; set; }

            [Required(ErrorMessage = "Email is required.")]
            [EmailAddress]
            public string Email { get; set; }

            [Required(ErrorMessage = "Password is required.")]
            [StringLength(100, MinimumLength = 6)]
            public string Password { get; set; }

            [Required(ErrorMessage = "Phone is required.")]
            [StringLength(15)]
            public string Phone { get; set; }

            [Required(ErrorMessage = "Address is required.")]
            [StringLength(200)]
            public string Address { get; set; }
        }

        public class OfficerRegisterDto
        {
            [Required(ErrorMessage = "Name is required.")]
            [StringLength(100)]
            public string Name { get; set; }

            [Required(ErrorMessage = "Email is required.")]
            [EmailAddress]
            public string Email { get; set; }

            [Required(ErrorMessage = "Password is required.")]
            [StringLength(100, MinimumLength = 6)]
            public string Password { get; set; }

            [Required(ErrorMessage = "Officer role is required.")]
            public OfficerRole Role { get; set; }

            [Required(ErrorMessage = "Department ID is required.")]
            public int DepartmentId { get; set; }
        }


    }
}